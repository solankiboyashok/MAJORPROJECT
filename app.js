const express=require("express");
const mongoose=require("mongoose");
const app = express();
const Listing=require("./models/listing");
const path=require("path");
const methodoverride=require("method-override");
const engine = require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./Schema.js");



const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
main()
.then(()=>{
    console.log("Connected to Database");
})
.catch((err) => {
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodoverride('_method'))
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("root");
})

//validate listing for joi error
const validateListing=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404, errMsg);
    }else{
        next();
    }
}

//index route
app.get("/listing",wrapAsync(async(req,res)=>{
   let allListing= await Listing.find({});
   res.render("listing/index.ejs",{allListing});
}))

//new route
app.get("/listing/new",(req,res)=>{
     res.render("listing/new.ejs");
  });
//read route
app.get("/listing/:id",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listing/show.ejs",{listing});

}))
//create route
app.post("/listing",validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
}));

//edit route
app.get("/listing/:id/edit",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    
    res.render("listing/edit.ejs",{listing});
}))
//put route
app.put("/listing/:id",validateListing,wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send Valid data from listing!");
    }
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listing/${id}`);

}))
//delete route
app.delete("/listing/:id",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndDelete(id,{...req.body.listing});
    res.redirect("/listing");

}))

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
})
//error handler
app.use((err,req,res,next)=>{
    let{status=500,message="something went wrong"}=err;
  // res.status(status).send(message);
  res.status(status).render("error.ejs",{message});
})

app.listen(4000,()=>{
    console.log(`Server is running port:4000`);
});