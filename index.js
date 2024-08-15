import express from "express";
import fetch from "node-fetch"
import redis from "redis"

const PORT = process.env.PORT || 5000
const REDIS_PORT = process.env.REDIS_PORT || 6379

const client = redis.createClient(REDIS_PORT)
const app = express()
app.use(express.json())

//Set the Response from the 
function setResponse(username, repos) {
    return `<h2>${username} has ${repos} GitHub repos</h2>`
}

//Apply the Cache Middleware to store the value
function cache() {
    const username = req.params.username
    client.get(username, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            res.send(setResponse(username, repos))
        } else {
            next();
        }
    })
}

async function getRepos(req, res, next) {
    try {
        //Fetch the data from the GitHub API
        console.log("Fetching Data..............");
        const username = req.params.username
        const response = await fetch(`https://api.github.com/users/${username}`)
        const data = response.json()
        const repos = data.public_repos

        client.setEx(username, 3600, repos)  //This line of code does something called Cache Invalidation, The first argument is the key, second argument is TT: and the third value is the Value
        res.send(data)
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}

//Fetching the Data from the GitHub API and rendering it to this URL
app.get("/repos/:username/", cache, getRepos)

//Listen to the application on port 5000
app.listen(5000, () => {
    console.log(`Backend Server is currently running on port ${PORT}`);
})