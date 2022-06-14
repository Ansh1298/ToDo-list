//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-anshuman:test1234@cluster0.iyzp0lt.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemSchema={
  name:String
};
const Item= mongoose.model(
  "Item",
  itemSchema
);
const item1=new Item({
  name:"Welcome to your todo list"
});
const item2=new Item({
  name:"Hit the + button to add item"
});
const item3=new Item({
  name:"<-- hit this to delete an item"
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully saved");
        }
      });
      res.redirect("/");
    }
    else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  });



});
//for custom list entered in browser
app.get("/:customListName",function(req,res){
  //it gets the name entered
  const customListName=_.capitalize(req.params.customListName);
  //it finds whether entered name is already present in database  or not
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show an existing list

        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item = new Item({
    name:itemName
  });
  //if list name is today
  if(listName=== "Today"){
  item.save();
  res.redirect("/");
}
//if list is a custom list
else{
  //find the list in collections
  List.findOne({name:listName},function(err,foundList){
    //add the new item in the list
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })
}

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
//it deletes from default list
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
        if(!err){
          console.log("successfully deleted item");
          res.redirect("/");
        }
    });
  }
  //it deletes from custom list
  else{
    //pull deletes a list item and findoneanduopdate take three parameters listname to update conditions and callback
    List.findOneAndUpdate({name:listName},{$pull: {items: { _id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});
