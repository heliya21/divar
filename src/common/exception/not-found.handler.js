function NotFoundHandler(app){
    app.use((req,res,next) => {
        res.status(404).json({
            message: "Route Not Found"
        })
    })
}

module.exports = NotFoundHandler