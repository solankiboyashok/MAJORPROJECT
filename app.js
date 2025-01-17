const express=require("express");
const mongoose=require("mongoose");
const app = express();
const Listing=require("./models/listing");
const path=require("path");
const methodoverride=require("method-override");
const engine = require("ejs-mate");



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
//index route
app.get("/listing",async(req,res)=>{
   let allListing= await Listing.find({});
   res.render("listing/index.ejs",{allListing});
})
//new route
app.get("/listing/new",(req,res)=>{
     res.render("listing/new.ejs");
  });
//read route
app.get("/listing/:id",async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listing/show.ejs",{listing});

})
//create route
app.post("/listing", async (req, res, next) => {
    let result = ListingSchema.validate(req.body);
    console.log(result.error);
    if (result.error) {
     
        throw new ExpressError(404, result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
});

//edit route
app.get("/listing/:id/edit",async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    
    res.render("listing/edit.ejs",{listing});
})
//put route
app.put("/listing/:id",async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listing/${id}`);

})
//delete route
app.delete("/listing/:id",async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndDelete(id,{...req.body.listing});
    res.redirect("/listing");

})


app.listen(4000,()=>{
    console.log(`Server is running port:4000`);
});