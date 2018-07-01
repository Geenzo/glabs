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

      axios.get(GLABSAPIROOT + "/v1/ReturnedDebitItems")
        .then((resp) => {    
          this.returnedDebits = resp.data.returnDebits;
          this.totalBacs = resp.data.totalProcessedBacs
          console.log(this.returnedDebits)    
        })
        .catch((err) => {
          console.log('Error')
          console.error(err)
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
          toastr.success('Successfully uploaded new BAC!', 'Success')

        }, (error) => {
          if (error.response.status === 422) {
            toastr.error(error.response.data.reason, `Error: ${error.response.status} - ${error.response.statusText}`)
            console.error(error.response)
          }
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
    
    toastr.options = {
      "closeButton": false,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-bottom-center",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
  },

});

setInterval(() => {
  app.getReturnedDebits();
}, UPDATE_INTERVAL);
