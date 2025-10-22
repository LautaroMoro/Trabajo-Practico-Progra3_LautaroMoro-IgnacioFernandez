/** 
const API_URL = "https://dummyjson.com/products";

Función 1.0 para obtener los productos de la API(Obtenia solamente una categoria con el siguiente codigo):
async function obtenerProductos() {
  try {
    const response = await fetch(`${API_URL}`); //limite de productos a mostrar
    if (!response.ok) throw new Error("Error al obtener productos");

    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error al conectar con la API:", error);
    return [];
  }
}
*/

/**--------------------------------------------------------------------------------------------------------------------------------------------------------------------- */





// Función asincrona renovada para obtener los productos de ropa de 3 categorias(remeas de hombres, vestidos de mujeres y zapatillas de hombres)
async function obtenerProductos() {
  try{
    //  Documentacion para entender y usar Promise.all(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    //Se realizan las 3 peticiones a la API en paralelo y se guardan las respuestas en variables(cada una con su respectiva categoria).
    const [remerasRes, vestidoRes, zapatillasRes] = await Promise.all([
      fetch("https://dummyjson.com/products/category/mens-shirts"),
      fetch("https://dummyjson.com/products/category/womens-dresses"),
      fetch("https://dummyjson.com/products/category/mens-shoes")
    ]);
    // Se verifica que todas las peticiones hayan sido exitosas(Codigo 200-299). Si alguna peticion falla, se lanza un error. 
    if (!remerasRes.ok || !vestidoRes.ok || !zapatillasRes.ok) throw new Error("Error al obtener los productos");
    // Las respuestas de las peticiones(que vienen como texto) a la API se convierten a formato JSON.
    // las variables remeras, vestidos y zapatillas pasan a ser objetos con la estructura que devuelve la API DummyJSON.
    const [remeras, vestidos, zapatillas] = await Promise.all([
      remerasRes.json(),
      vestidoRes.json(),
      zapatillasRes.json()
    ]);
    // la variable ropaCombinada es un array plano que contiene los 3 arrays de los productos juntos.
    // Se utiliza el operador spread(...) para combinar los arrays de productos de cada categoria en uno solo(ESE SERIA ropaCombinada).
    //  Documentacion operador spread: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    const ropaCombinada = [...remeras.products, ...vestidos.products, ...zapatillas.products];
    return ropaCombinada;
  // Si algo falla en el try, el bloque catch lo capturara e imprimera el error en consola.
  // Y para evitar que la aplicacion se rompa, se devolvera un array vacio.
  }catch(error){
    console.error("Error al conectar con la api", error);
    return [];
  }

}  
