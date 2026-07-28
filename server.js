const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 8080;


app.use(cors());
app.use(express.json());



async function getThumbnail(assetId) {

    try {

        const url =
        `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=150x150&format=Png&isCircular=false`;


        const response = await fetch(url);

        const data = await response.json();


        if (
            data.data &&
            data.data[0] &&
            data.data[0].state === "Completed"
        ) {

            return data.data[0].imageUrl;

        }


    } catch(e){

        console.log(
            "Error thumbnail:",
            assetId
        );

    }


    return null;

}




app.get('/api/catalog/search', async (req,res)=>{


try{


const keyword = req.query.keyword || "";
const limit = req.query.limit || 50;
const cursor = req.query.cursor || "";



let url =
`https://catalog.roblox.com/v2/search/items/details?limit=${limit}`;



if(keyword){

    url +=
    `&keyword=${encodeURIComponent(keyword)}`;

}



if(cursor){

    url +=
    `&cursor=${encodeURIComponent(cursor)}`;

}



console.log(
    "🔎 Buscando:",
    url
);




const response = await fetch(url,{

headers:{
    "Accept":"application/json",
    "User-Agent":"Roblox"
}

});



if(!response.ok){

throw new Error(
    "Roblox API "+response.status
);

}




const data = await response.json();



let items = [];




for(const item of data.data || []){


    // SIN NOMBRE NO PASA
    if(
        !item.name ||
        item.name.trim()===""
    ){

        continue;

    }



    // pedir imagen
    const image =
    await getThumbnail(item.id);



    // SIN IMAGEN NO PASA
    if(!image){

        continue;

    }




    items.push({

        id:item.id,

        name:item.name,

        price:item.price ?? 0,

        image:image,

        assetType:item.assetType || 0,

        creator:
        item.creator?.name || "Roblox"

    });



}





res.json({

data:items,

nextPageCursor:
data.nextPageCursor || null

});



console.log(
    "✅ Enviados:",
    items.length
);



}
catch(error){


console.error(
    "❌ Error:",
    error.message
);



res.json({

data:[],

nextPageCursor:null

});


}



});





app.listen(PORT,"0.0.0.0",()=>{

console.log(
`🚀 Servidor corriendo en puerto ${PORT}`
);

});
