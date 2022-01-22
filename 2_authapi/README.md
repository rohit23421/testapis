# A simple Backend app with mongodb as database built on nodejs and expressjs for user to register and login to the DB and then post on the movie route with the required details with JWT authentication and httpOnly cookie

### (port) specified here is 8800

#### to register, visit the {protocol}://localhost:port/api/auth/register route and fill the username,email & password

#### to login, visit the {protocol}://localhost:port/api/auth/login route and fill email and password to receive the  jwt token associated and httpOnly cookie

#### to post movie, visit the {protocol}://localhost:port/api/movies/ route and fill the following details - 
                title(required)
                desc
                img
            
#### to query the required data from the DB first login with the user you created and then visit the get route at {protocol}://localhost:port/api/movies/
