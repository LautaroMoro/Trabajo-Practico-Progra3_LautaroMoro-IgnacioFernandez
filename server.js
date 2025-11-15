
import express from 'express';
import axios from 'axios';

// creamos el servidor con express
const app = express();
const PORT = 3000;


// Middleware para permitir solicitudes desde cualquier origen
// Aca tienen doc de que son los middlewares: https://expressjs.com/en/guide/using-middleware.html, y de que es cors: https://www.npmjs.com/package/cors
import cors from 'cors';

app.use(cors());
app.use(express.static('public'));

// Hacemos la solicitud con un Promise.all y axios para obtener los datos de las tres categorías
app.get("/api/products", async (req, res) => {
    try{
        // URLs de las categorías de la API dummyjson.com
        const URLS = [
            "https://dummyjson.com/products/category/mens-shirts",
            "https://dummyjson.com/products/category/womens-dresses",
            "https://dummyjson.com/products/category/mens-shoes"
        ];
        // Hacemos las solicitudes a las tres URLs en paralelo usando Promise.all y axios
        // Promise.all documentación: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
        // axios documentación: https://axios-http.com/docs/intro
        const [remeras, vestidos, zapatillas] = await Promise.all(
            URLS.map((url) => axios.get(url))
        );
        // Combinamos los productos de las tres categorías en un solo array, usando el operador spread
        const ropaCombinada = [
            ...remeras.data.products,
            ...vestidos.data.products,
            ...zapatillas.data.products
        ];
        // ponemos la respuesta con los porductos juntos en formato JSON
        // ¿Qué es un JSON? https://www.json.org/json-es.html
        res.json(ropaCombinada);


    } catch (error) {
        console.error("Error al conectar con la API:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});
// Iniciamos el servidor

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
/*
*Tienen que ejecutar dentro de la raiz del proyecto el comando "npm install express axios cors" para instalar las dependencias necesarias
*Luego para correr el servidor tienen que ejecutar "node server.js". 
*/ 