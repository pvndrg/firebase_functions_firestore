// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');

const serviceAccount = require('./credintials.json');

admin.initializeApp(admin.credential.cert(serviceAccount.envorment));

const db = admin.firestore();//getFirestore();


exports.addUserData = functions.https.onRequest(async(req, res)=>{
    try {
        // Add a new document with a generated id.
        let name = req.body.name;
        let age = req.body.age;
        let cityId = req.body.cityId;
        const docRef = await db.collection('users').add({
            name: name,
            age: age,
            cityId: cityId,
            createdOn: new Date()
        });
        return res.status(200).send({ "message":"data successfully added!","data":docRef.id});
    } catch (error) {
        return res.status(400).send({ "message":"data not added","data":error.message});
    }   
});

exports.addCityData = functions.https.onRequest(async(req, res)=>{
    try {
        // Add a new document with a generated id.
        let country = req.body.country;
        let city = req.body.city;
        const docRef = await db.collection('citys').add({
            country: country,
            city: city,
            createdOn: new Date()
        });
        return res.status(200).send({ "message":"data successfully added!","data":docRef.id});
    } catch (error) {
        return res.status(400).send({ "message":"data not added","data":error.message});
    }   
});

exports.updateUserData = functions.https.onRequest(async (req, res) => {
    // Update existing document document in collection "users" with ID 'alovelace'
    const docRef = db.collection('users').doc(req.body.id);
    let name = req.body.name;
    let age = req.body.age;
    let cityId = req.body.cityId;

    await docRef.update({
        name: name,
        age: age,
        cityId: cityId,
        updatedOn: new Date()
        });

        return res.status(200).send({ "message":"data successfully added!","data":docRef.id});
});

exports.updateCityData = functions.https.onRequest(async (req, res) => {
    // Update existing document document in collection "users" with ID 'alovelace'
    const docRef = db.collection('citys').doc(req.body.id);
    let country = req.body.country;
    let city = req.body.city;

    await docRef.update({
            country: country,
            city: city,
            updatedOn: new Date()
        });

        return res.status(200).send({ "message":"data successfully added!","data":docRef.id});
});

exports.setUsetData = functions.https.onRequest(async (req, res) => {
    // Add a new document in collection "users" with ID 'alovelace'
    const docRef = db.collection('users').doc('alovelace');

    await docRef.set({
        first: 'me',
        last: 'lace',
        born: 1816
        });

        return res.status(200).send({ "message":"data successfully added!","data":docRef.id});
})

exports.getUserData = functions.https.onRequest(async (req, res) => {
    console.log("params : ",req.params);
    console.log("body : ",req.body);
    console.log("query : ",req.query);
    let id = req.query.id;
    console.log("id -> ",req.body.id);

    const conversationID = req.query.name;

    console.log("name -> ", conversationID);
    if(id){
    const cityRef = db.collection('users').doc(id);
    const doc = await cityRef.get();
    if (!doc.exists) {
    console.log('No such document!');
    return res.status(500).send({"message":"No such document!"});
    } else {
    console.log('Document data:', doc.data());
    return res.send({message:"Datasucessfully fetched",data:doc.data()});
    }
    //res.status(200).send(doc.data());
}else{
    res.send("Invalid Request json");

}
})

exports.getAllUserData = functions.https.onRequest(async (req, res) => {

    const citiesRef = db.collection('users');
   // const snapshot = await citiesRef.where('capital', '==', true).get();
    const snapshot = await citiesRef.get();
    if (snapshot.empty) {
    console.log('No matching documents.');
    return res.status(500).send({"message":"No matching documents."});
    }  

    let array =await snapshot.docs.map((doc,index) => {
    console.log(doc.id, '=>', doc.data());
    return {
        id: doc.id,
        index: index,
        country: doc.data().country,
        name: doc.data().name,
        timeStamp: new Date(),
    }
    });
   return res.status(200).send(array);
})


exports.getAllUserWithCountryData = functions.https.onRequest(async (req, res) => {
    const userRef = db.collection('users').get()
    .then(async snapshot => {
        console.log('Write succeeded!');
        //console.log("user size -> ",snapshot.size);
        if(snapshot.empty){
            console.log('no matching documents.');
            return res.status(500).send({"message":"No matching documents."});
        }else{
        let array = snapshot.docs.map(async doc => {
            const contries = await getContries(doc.data().cityId);
            console.log("users --> ",doc.data());
            console.log("contries --> ",contries.country);
            return {
                id: doc.id,
                name: doc.data().name,
                age: doc.data().age,
                city: contries.city,
                country: contries.country
            }
        });

        console.log('array -> ',array);
       
        return Promise.all(array).then(finalUserData=>{
            console.log("array -> ",finalUserData);
            return res.status(200).send(finalUserData);
        }).catch(error => {
            console.log(error)
            return res.status(500).send(error)
        });

    }
      })
    .catch(error => {
        // Handle the error
        console.log(error)
        return res.status(500).send(error)
    });
})

async function getContries(cityId){
    let cityDetails;
    await db.collection('citys').doc(cityId).get()
    .then(snapshot => {
        cityDetails = snapshot.data();
        return cityDetails;
    }).catch(error => {
        // Handle the error
        console.log(error)
        cityDetails = ""
        return cityDetails;
    }); 
    return cityDetails;  
}