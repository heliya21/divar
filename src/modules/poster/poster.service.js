const OptionModel = require(".././option/option.model");
const autoBind = require("auto-bind");
const { isValidObjectId, Types, } = require("mongoose");
const createHttpError = require("http-errors");
const { default: slugify } = require("slugify");
const posterModel = require("../poster/poster.model");
const { PosterMessage } = require("./poster.message");
const CategoryModel = require("../category/category.model");


class PosterService {
    #model
    #optionModel
    #categoryModel
    constructor() {
        autoBind(this)
        this.#model = posterModel
        this.#optionModel = OptionModel
        this.#categoryModel = CategoryModel
    }
    async getCategoryOptions(categoryId) {
        const options = await this.#optionModel.find({category: categoryId})
        return options
    }
    async create(dto) {
        return await this.#model.create(dto)
    }
    async find(userId) {
        if(userId && isValidObjectId) return await this.#model.find({userId})
        throw new createHttpError.BadRequest(PosterMessage.InvalidRequest)
    }
    async checkExist(postId) {
        if(!postId || !isValidObjectId(postId)) throw new createHttpError.BadRequest(PosterMessage.InvalidRequest)
        const [post] = await this.#model.aggregate([
            {
                $match: {_id: new Types.ObjectId(postId)}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    userMobile: "$user.mobile"
                }
            },
            {
                $project: {
                    user: 0
                }
            }
    ])
        if(!post) throw new createHttpError.NotFound(PosterMessage.NotFound)
        return post
    }
    async remove(postId) {
        await this.checkExist(postId)
        await this.#model.deleteOne({_id: postId})
    }
    async findAll (options) {
        let {category, search} = options;
        const query = {};
        if (category) {
            const result = await this.#categoryModel.findOne({slug: category});
            let categories = await this.#categoryModel.find({parents: result._id}, {_id: 1});
            categories = categories.map(item => item._id);
            if (result) {
                query['category'] = {
                    $in: [result._id, ...categories]
                };
            } else {
                return [];
            }
        }
        if (search) {
            search = new RegExp(search, "ig");
            query['$or'] = [
                {title: search},
                {description: search},
            ];
        }
        const posts = await this.#model.find(query, {}, {sort: {_id: -1}});
        return posts;
    }
}


module.exports = new PosterService()