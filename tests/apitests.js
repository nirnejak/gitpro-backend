const chai = require('chai')
const chaiHttp = require('chai-http')

let should = chai.should()

chai.use(chaiHttp)

let app = require('../index')

describe('Collaborators', () => {
  describe('/GET collaborators', () => {
    it('it should GET all the collaborators', (done) => {
      chai.request(app)
        .get('/api/collaborators')
        .end((err, res) => {
          (res).should.have.status(200);
          (res.body).should.be.a('array');
          done();
        });
    });
  });
  describe('/GET a collaborator', () => {
    it('it should GET a collaborator', (done) => {
      chai.request(app)
        .get('/api/collaborators/kevivmatrix')
        .end((err, res) => {
          (res).should.have.status(200);
          (res.body).should.be.a('object');
          done();
        });
    });
  });
});