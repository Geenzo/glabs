let GLABSAPIROOT = "http://localhost:3001";

//rate at which new data is received from backend (checks for new bacs every minute)
let UPDATE_INTERVAL = 60 * 1000;

let app = new Vue({
  el: "#app",
  data: {
    returnedDebits: {},
    totalBacs: {},
    correctFileType: true
  },

  methods: {

    getReturnedDebits: function() {
      let self = this;

      axios.get(GLABSAPIROOT + "/v1/ReturnedDebitItems")
        .then((resp) => {    
          this.returnedDebits = resp.data.returnDebits;
          this.totalBacs = resp.data.totalProcessedBacs
          console.log(this.returnedDebits)    
        })
        .catch((err) => {
          console.log('Error');
          console.error(err);
        });
    },

    uploadNewBac: function(bacFile) {
      let uploadedFile = document.getElementById('uploadBacInput')
      let formData = new FormData()
      
      formData.set('uploadedBAC', uploadedFile.files[0])

      const config = {
          headers: { 'content-type': 'application/json' }
      }

      const url = `${GLABSAPIROOT}/v1/UploadBAC`
      
      axios.post(url, formData)
        .then((resp) => {
          //TODO::create toast when upload complete
          console.log(resp)
        }) 
      
    },

    checkUploadFileType: function(e) {
      let inputFile = document.getElementById('uploadBacInput').files[0]

      if (inputFile) {
        if(inputFile.type !== "text/xml") {
          this.correctFileType = false
        } else {
          this.correctFileType = true
        }  
      }

    }

  },

  created: function() {
    this.getReturnedDebits();
  },

});

setInterval(() => {
  app.getReturnedDebits();
}, UPDATE_INTERVAL);
