const models = require('../setup'),
    moment = require('moment')

const fetchReadyBACS = () => {
    return new Promise((resolve, reject) => { 
        return models.BacsDocument.find({state: "Ready For Processing"}).then((returnDebits) => {
            if(returnDebits.length > 0) {
                resolve(returnDebits)
            } else {
                reject("No BACs need to be processed")
            }        
        })
    })  
}

const updateBACS = (readyBACS) => {
    let processedBACS = readyBACS.map(bac => {
        return new Promise((resolve, reject) => {
            let processedBAC = processBAC(bac)
            resolve(processedBAC)
        })
    })

    return Promise.all(processedBACS)
}

const processBAC = (bac) => {
    return new Promise((resolve, reject) => {
        let updateDate = moment()
        
        models.BacsDocument.findByIdAndUpdate(bac._id, {$set: {state: "Processed", updated: updateDate }}, {new: true}).then((updatedBAC) => {
            console.log(`${updatedBAC.name} - bac has been processed..`)
            resolve(updatedBAC)
        })
    })
    
}

const ReturnDebits = () => {
    return fetchReadyBACS()
        .then(updateBACS)
        .then(bacProcessed => {
            console.log(`${bacProcessed.length} BACS have been processed successfully - Return Debits Task now exiting...`)
            return bacProcessed.length
        })
        .catch((err) => {
            console.log(`${err} - Return Debits Task now exiting...`)
        })
}

module.exports = {ReturnDebits}