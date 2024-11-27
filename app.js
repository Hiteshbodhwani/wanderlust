const express=require('express');
const app = express();
const mongoose=require('mongoose');
const Listing =require("./models/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapasync=require("./utils/wrapasync.js");
const expresserror=require("./utils/expresserror.js");
const {listingSchema,reviewSchema}=require("./schema.js")
const Review =require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
let dburl = "mongodb+srv://Hitesh:6IxSpHWnPo0k78sE@cluster0.hbwtn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const passport = require("passport");
const Localstrategy =require("passport-local");
const User= require("./models/user.js"); 
const store = MongoStore.create({
  mongoUrl : dburl,
  crypto:{
    secret:"mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});
store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
});
const sessionOptions = {
   store,
  secret : "mysupersecretcode",
  resave:false,
  saveUnintialized:true,
  cookie:{
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
  },
};



app.get('/',(req,res)=>{
  res.send('hi i am root');
})

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success =req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser = req.user;
  next();
})





const listings= require("./routes/listing.js");
const review= require("./routes/review.js");
const user= require("./routes/user.js");




main()
.then(()=>{
    console.log('connected to db');
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect("mongodb+srv://Hitesh:6IxSpHWnPo0k78sE@cluster0.hbwtn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

// const validateListing = (req,res,next)=>{
//   let {error}=listingSchema.validate(req.body);
   
//     if(error){
//       let errmsg = error.details.map((el)=> el.message).join(",");
//       throw new expresserror(400,errmsg);
//     }else{
//       next();
//     }
// }

// app.get("/demouser",async(req,res)=>{
//   let fakeuser=new user({
//     email:"student@gmail.com",
//     username:"delta-student",
//   });
//   let registeredUser = await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// });

app.use("/listings",listings);

app.use("/listings/:id/reviews",review);

app.use("/",user);



// app.get('/testlisting',async (req,res)=>{
// let samplelisting= new listing({
//     title:"My Home",
//     description:"By the Beach",
//     price:1200,
//     location:"Calangute,Goa",
//     country:"India"
// });
// await samplelisting.save();
// console.log('sample was saved');
// res.send('successfull testing');
// });
app.all('*',(req,res,next)=>{
  next(new expresserror(404,"page not found"));
})
app.use((err,req,res,next)=>{
let {statuscode=500,message="something went wrong"}=err;
res.status(statuscode).render("error.ejs",{message});
// res.status(statuscode).send(message);
});

app.listen(3000,()=>{
    console.log('server is listening to port 3000');
});

