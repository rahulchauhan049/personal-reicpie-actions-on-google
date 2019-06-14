"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.database();
const { dialogflow, Suggestions, BasicCard, Button, Image, SimpleResponse, SignIn } = require('actions-on-google');
const app = dialogflow({
    debug: true
});


app.intent('Default Welcome Intent', (conv) => {
    conv.ask("HI tell me a dish name");
});

app.intent("recipe", conv => {
    conv.user.storage.dish = {};
    let ingredients = [];
    let ingredientsteller = [];
    const dish = (conv.parameters['dishesh']);
    conv.user.storage.dish = dish;
    conv.user.storage.count = 0;
    return db.ref("/").once("value", snapshot => {
        const data = snapshot.val();
        for(let x in data[dish]["ingredients"]){
            ingredients.push(data[dish]["ingredients"][x]);
        }
        for(let i=0;i<ingredients.length;i++){
            ingredientsteller[i] = `Step${i+1}: ${ingredients[i]}  \n` 
        }
        conv.ask(`Here's the ingredients for ${dish}.`)
        conv.ask(new SimpleResponse({
            speech: `Say "next" when you are ready.`,
            text: `${ingredientsteller.toString()}`,
        }))

    });
});

app.intent("recipe next", conv=>{
    const dish = conv.user.storage.dish;
    let count = conv.user.storage.count;
    let recipe = [];
    if(dish){
        return db.ref("/").once("value", snapshot => {
            const data = snapshot.val();
            var NumberCount = Object.keys(data[dish]["recipie"]).length;
            for(let x in data[dish]["recipie"]){
                recipe.push(data[dish]["recipie"][x]);
            }
            if(count<(NumberCount-1)){
                conv.user.storage.count += 1;
                conv.ask(recipe[count]);
            }
            if(count==(NumberCount-1)){
                conv.close(recipe[count]);
            }
            
        });
    }
    else{
        conv.ask("Please tell me a dish name");
    }
});

exports.googleAction = functions.https.onRequest(app);