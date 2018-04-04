const models = require('../../services/GlabsAPI/app/setup')
const {expect} = require('chai')
const moment = require('moment')

describe('BacsDocument', () => {

  it('validation should fail if bacsDocument is empty', (done) => {
    let bacsDocument = new models.BacsDocument({
      name: `BAC Test 123`,
      created: moment().format('DD-MM-YYYY'),
      updated: moment().format('DD-MM-YYYY'),
      state: "Ready For Processing"
    });
    bacsDocument.validate((err) => {
      expect(err.errors.bacsDocument).to.exist;
      done()
    })
  })

  it('validation should fail if name is empty', (done) => {
    let bacsDocument = new models.BacsDocument({
      created: moment().format('DD-MM-YYYY'),
      updated: moment().format('DD-MM-YYYY'),
      bacsDocument: new Object(),
      state: "Ready For Processing"
    })
    bacsDocument.validate((err) => {
    expect(err.errors.name).to.exist
    done()
    })
  })

  it('validation should fail if state is empty', (done) => {
    let bacsDocument = new models.BacsDocument({
      name: `BAC Test 123`,
      created: moment().format('DD-MM-YYYY'),
      updated: moment().format('DD-MM-YYYY'),
      bacsDocument: new Object()
    })
    bacsDocument.validate((err) => {
      expect(err.errors.state).to.exist
      done()
    })
  })

  
  it('created date should default value if not set', (done) => {
    let bacsDocument = new models.BacsDocument({
      name: `BAC Test 123`,
      updated: moment().format('DD-MM-YYYY'),
      bacsDocument: new Object(),
      state: "Ready For Processing"
    })
    
    expect(bacsDocument.created).to.exist
    done()
  })

  it('updated date should default value if not set', (done) => {
    let bacsDocument = new models.BacsDocument({
      name: `BAC Test 123`,
      created: moment().format('DD-MM-YYYY'),
      bacsDocument: new Object(),
      state: "Ready For Processing"
    })
    
    expect(bacsDocument.updated).to.exist
    done()
  })

});