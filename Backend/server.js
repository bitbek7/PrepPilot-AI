require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const port = process.env.PORT || 8888;

connectToDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on the port ${port}`)

        })
    }
    )
    .catch(() => {
        console.log("Error on connecting with the database")
    }
    )