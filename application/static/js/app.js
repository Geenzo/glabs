let GLABSAPIROOT = "http://localhost:3001";

//rate at which new data is received from backend
let UPDATE_INTERVAL = 60 * 1000;

let app = new Vue({
  el: "#app",
  data: {
    returnedDebits: {},
    totalBacs: {}
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

  },

  created: function() {
    this.getReturnedDebits();
  },

});

setInterval(() => {
  app.getReturnedDebits();
}, UPDATE_INTERVAL);
