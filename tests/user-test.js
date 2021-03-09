const request = require("supertest");
const sinon = require("sinon");
const test = require("ava");
const proxyquire = require("proxyquire");
let app = null;

const version = "/v1";
//separate context
const sandbox = sinon.createSandbox();
let userStub = null;

test.before((t) => {
  userStub = {
    save() {},
  };
  userStub["@global"] = true;

  sandbox.stub(userStub, "save");
  userStub.save.withArgs({}).returns(true);

  app = proxyquire("../app", {
    "./models/userModel": userStub,
  });
});
test.after(() => {
  sandbox.restore();
});
/**
 *
 * Save user data:
 * Given a user with his name and valid email
 * When the user send his data to the system
 * Then the system must save the user data
 */
//pass .cb to test async
test.serial.cb("Save valid user data", (t) => {
  const user = { name: "midoriya", email: "deku@gmail.com" };

  //request of supertest is asyncronous
  //we must indicates where is finish
  request(app)
    .post(`${version}/users`)
    .send(user)
    .expect("Content-Type", /json/)
    .expect(201)
    .end((err, res) => {
      t.falsy(err, "should not error");
      //indicates that the test  is finished
      t.end();
      sandbox.assert.calledOnce(userStub.save);
      sandbox.assert.calledWith(userStub.save, user);
    });
});
/**
 *
 * Save user data:
 * Given a user with his name and invalid email
 * When the user send his data to the system
 * Then the system must reject the user data
 */
//if we want unit test independent add serial to test ava
test.serial.cb("Validate user data", (t) => {
  const user = { name: "midoriya", email: "dekugmail.com" };

  //request of supertest is asyncronous
  //we must indicates where is finish
  request(app)
    .post(`${version}/users`)
    .send(user)
    .expect("Content-Type", /json/)
    .expect(400)
    .end((err, res) => {
      t.falsy(err, "should not error");
      //indicates that the test  is finished

      t.deepEqual(res.body, {
        errors: {
          email: 'the email must be like "john.doe@mail.com"',
        },
      });
      t.end();
    });
});
