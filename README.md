# glabs
This app will use nodeJS to allow the user to upload new BACs in an .XML format, which will then take the .xml file, convert xml to JSON and then store this data in the mongoDB collection. Once this has been done it will then .zip the older BAC directory and place it in the `BACSDirectory/archivedBACS` folder. for archiving purposes

After the the above has taken place the app will then run the `returnDebits.js` script that will take any BACS in the mongoDB instance with `state: "Ready For Processing` and process them to returnedDebits. this task will also run every minute after launch to look for new BACS that come into mongoDB and are ready to be Processed.

The front-end of this application `http://localhost:3001/application/` for the user to have a simple UI to upload and view processed BACS. The front-end will also automatically retrieve all new Processed BACS from the back end of the application every minute using cron jobs to run back-end processes and socket.io for real time updates

# Running the application
Once you have Node.js and NPM installed [See Here](https://docs.npmjs.com/getting-started/installing-node)
and installed MongoDB [See Here](https://docs.mongodb.com/manual/installation/)

(This app and Mongo DB by default will run on `localhost:3001` )

Once you have the above installed - follow the following steps to start the application

1. `git clone https://github.com/Geenzo/glabs.git`
2. run `npm install` in the root of the cloned repo
3. have local instance of mongoDB running
4. run `npm start`
5. go to `http://localhost:3001/application/`


# Testing

 tests were written using Mocha and Chai, to run tests please run `npm install` 
 in the root of the cloned repo and then run `npm test` to perform tests

 # Tech Stack

 For this project the following has been used

 <h4>Front-end:</h4>
 Vue.js

 <h4>Backend:</h4>
 Node.js<br>
 MongoDB<br>
 Socket.io<br>
 AWS S3 buckets

<h4>Testing:</h4>
Mocha<br>
Chai

<h4>Dependancies:</h4>
archiver: ^2.1.1<br>
body-parser: ^1.18.2<br>
chai: ^4.1.2<br>
consign: ^0.1.6<br>
cron: ^1.3.0<br>
express: ^4.16.3<br>
glob: ^7.1.2<br>
mocha: ^5.0.5<br>
moment: ^2.22.0<br>
mongoose: ^5.0.12<br>
opn: ^5.3.0<br>
path: ^0.12.7<br>
xml2js: ^0.4.19<br>
formidable: ^1.2.1<br>
socket.io: ^2.1.1<br>
toastr: ^2.1.4<br>