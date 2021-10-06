//env variable is set to test
// process.env.NODE_ENV = 'test';
let chai = require('chai');
const {describe} = require('mocha');
let chaiHttp = require("chai-http");
let server = require('../server');

//Assertion style
chai.should();

chai.use(chaiHttp);
describe('Test API', () => {

  


    //Test Get route without basic auth
    describe("GET /user/self", () =>{
        it("check if unauthorized access works", (done) =>{
            chai.request(server).get("/user/self")
            .end((err,res) =>{
                res.should.have.status(401);
                // res.body.should.be.a('array');
                // res.body.length.should.be.eql(5);
            done();
            })
        })
        it("check for wrong url", (done) =>{
            chai.request(server).get("/user/task")
            .end((err,res) =>{
                res.should.have.status(404);
            done();
            })
        })
    })

     // Test Post route
    //  describe("Post /user",() =>{
    //     it("Post all the user details", (done) =>{
    //         const data = {
    //             first_name: 'joe',
    //             last_name: 'daniel',
    //             password: 'skdjfhskdfjhg',
    //             username: 'joe@gmail.com'
    //         };
    //         chai.request(server)
    //         .post('/user')
    //         .send(data)
    //         .end((err,res) =>{
    //              res.should.have.status(201);
    //              res.body.should.be.a('object');
    //              res.body.should.have.property('id');
    //              res.body.should.have.property('username');
    //              res.body.should.have.property('first_name');
    //              res.body.should.have.property('last_name');
    //              res.body.should.have.property('account_created');
    //              res.body.should.have.property('account_updated');
    //              res.body.length.should.be.eql(6);
    //         done();
    //         })
            
    //     })
    // })
        
    

    
});





