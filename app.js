const express=require("express");
const mongoose=require("mongoose");
const app = express();
const Listing=require("./models/listing");
const path=require("path");
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");



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
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
   console.log("welcome");
   res.send("welcome");
});

app.get("/listings",async (req, res)=>{
let Alllisting=await Listing.find({});
res.render("listings/index.ejs",{Alllisting});
});


//New Route
app.get("/listings/new",(req,res)=>{
 res.render("listings/new.ejs");
});
//show Route
app.get("/listings/:id", async(req,res)=>{
let {id}=req.params;
const listing= await Listing.findById(id);
res.render("listings/show.ejs",{listing});
});

app.post("/listing",(req,res)=>{
    let newListing=Listing(req.body.listing);
    newListing.save();
    res.redirect("/listings");
})

app.get("/listing/:id/edit",async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

app.put("/listing/:id",async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listings/${id}`);
});

app.delete("/listing/:id",async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndDelete(id,{...req.body.listing});
    res.redirect("/listing");

});
// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");

// });

app.listen(4000,()=>{
    console.log(`Sever is running port:4000`);
});