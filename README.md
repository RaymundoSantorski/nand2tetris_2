# Nand to tetris part 2

**Repositorio para guardar mi progreso en curso Nand2Tetris part 2**

En este curso haré un lenguaje de programación (Jack) y para ello veremos como se hace un compilador de dos pasos, que consta del traductor de maquina virtual y el compilador. El compilador va a interpretar nuestro codigo en Jack para transformarlo en lenguaje VM (maquina virtual)
que tiene un enfoque de aritmetica de pila (Stack Arithmetic) para funcionar, luego el VM Translator va a interpretar el lenguaje VM para convertirlo en codigo en lenguaje Hack Assembler, de esta manera podremos tranformarlo en instrucciones binarias mediante el ensamblador que hicimos en el curso pasado.
Y temrinaremos por escribir un sistema operativo con el lenguaje de programación Jack.
Al ser una continuación del curso Nand2Tetris part 1, las carpetas van a aparecer en orden desde el 07.

## Modulo 07 ***VM I: Stack Arithmetic***

El primer paso para escribir el VM translator será escribir un traductor de la parte aritmetica, lo cuál significa hacer operaciones.

### **vm_emulator**
Utilizamos la arquitectura planteada en el curso para mantener limpio nuestro codigo y hacerlo más fácil de entender.
Utilizamos un arreglo ***ariLogCommands*** que contiene todas las intrucciones que denotan una operación aritmetica o logica (add, sub, neg, eq, gt, lt, and, or, not), un objeto ***commands*** que son todos los comandos que no son logicos o aritmeticos (pop, push, label, goto, if-goto, function, call, return) y tienen un valor asociado que es como identificaremos que instrucción es cuando aparezca en el codigo, aunque esn este modulo solo utilizaremos ***pop*** y ***push*** para poder hacer las operaciones.
También tenemos un objeto ***locations***: 
```
let locations = {
    local: 'LCL',
    argument: 'ARG',
    this: 'THIS',
    that: 'THAT',
}
```
***locations*** incluye los segmentos de memoria donde podemos guardar los valores de las operaciones que realicemos.

El programa tiene como punto de entrada la función main. Como encargado de escribir el codigo ensamblador tenemos la clase CodeWriter y para interpretar las instrucciones tenemos la clase Parser.
main es una función unica que se encarga de llamar una instancia de la clase parser, extraer de ahí la instrucción y sus parametros y luego utiliza una instancia de la clase CodeWriter para escribir el comando en ensamblador según corresponda.

#### Parser 
Tiene un constructor que recibe el archivo del cual se extraerán las instrucciones. Tiene un metodo ***hasMoreCommands*** que nos dice si hay más comandos en el archivo y así saber si continuaremos con el proceso o debemos terminar, así evitamos error en la ejecución del programa.
Tenemos el metodo ***advance*** que lee el siguiente comando valido en el archivo y lo guarda.
Está el metodo ***commandType*** que nos dice el tipo del comando actual (el que está guardado).
Y tenemos el metodo ***fields***, que regresa en un arreglo los segmentos de la instrucción actual, que serían el comando en si, en que segmento de la memoria se va a guardar y el indice de ese segmento.

#### CodeWriter
Tiene un constructor que recibe la referencia al archivo de salida (donde escribirá los comandos traducidos) y el nombre del archivo que se está leyendo.
Tiene un metodo ***writeAritmetic*** que se encarga de escribir el codigo en lenguaje ensamblador según la instrucción aritmetica o lógica recibida. unicamente recibe el comando.
Tiene un metodo ***writePushPop*** que escribe en lenguaje ensamblador las intrucciones de tipo push/pop. Recibe el comando, el segmento y el indice.
Y tiene el metodo ***close*** que sirve para cerrar el archivo en el que se está escribiendo y así evitar errores en la ejecución del programa.

Cabe aclarar que la importancia de todos estos metodos radica en que no solo es traducir una palabra por otra, cada instrucción de la maquina virtual equivale a varias instrucciones en lenguaje ensamblador.
Por ejemplo para hacer un push, tenemos que apuntar la dirección de memoria hacia el siguiente espacio vacío en la pila, luego insertar el valor, luego aumentar el indice para apuntar al siguiente espacio vacío para dejarlo listo para hacer otra operación. 
Para hacer operaciones aritmeticas como la suma, tenemos que hacer pop del ultimo valor en la pila, almacenarlo en algún lado temporalmente, hacer pop del siguiente valor en la pila, hacer la operación con ambos valores, y hacer push del resultado en el mismo espacio de memoria donde estaba el segundo valor que utilizamos.
Y así ocurre con distintas instrucciones, que además de que ya es más largo explicarlo que escribir la instrucción, traducir todo eso a lenguaje ensamblador ocupa aun muchisimas más lineas de codigo.

Para probarlo se nos proporcionan archivos .vm que debemos traducir a archivos .asm, la Hack Computer que nos proporcionan en el curso ya tiene la capacidad de intrepetar estos archivos sin necesidad de pasarlos a instrucciones binarias.
Debemos ejecutar el programa junto con el archivo .tst (archivos de prueba) correspondiente y este se encargará de extraer un archivo .out (las salidas del programa, o en este caso pasa a un archivo los registros de memoria criticos para analizar el comportamiento de nuestro programa).
Este archivo .out lo compara con otro archivo proporcionado .cmp y si son iguales significa que el programa se tradujo exitosamente.
Tenemos pruebas basicas, pruebas de acceso a la memoria, de puntero y estaticas, así como pruebas de Aritmetica de pila, que incluyen suma y la prueba de la pila.

## Modulo 08 **VM II: Program Control**

En este modulo nos encargaremos de implementar en nuestra VM las intrucciones de control y funciones.
También añadiremos funcionalidad para interpretar varios programas escritos en VM.

### **fullVM**
Es nuestro programa final que se encarga de interpretar las instrucciones y escribirlas en lenguaje ensamblador.

Aún contiene el arreglo de comandos logicos y aritmeticos, el objeto con el resto tipos de comandos y el arreglo de los segmentos de memoria donde podemos almacenar los resultados. Incluye las clases Parser y CodeWriter, así como la función main, solo que en este modulo extendemos su funcionalidad. Añadimos una función qué explicamos a continuación y también listamos los nuevos metodos de la clase CodeWriter.

#### loop
Añadimos esta nueva función para realizar el proceso de verificar si aun hay comandos en el archivo .vm que estamos interpretando, así como escribir la instrucción en el archivo destino.
Recibe como argumentos las instancias de nuestras clases Parser y CodeWriter de manera que trabajemos con los datos actuales.

Utilizamos, como lo dice su nombre, un bucle while y como condición le asignamos el valor de hasMoreCommands, así que cuando ya no tengamos más comandos por interpretar, el bucle finalizará. 
Dentro del bucle lo primero que hacemos es leer la siguiente instrucción mediate el metodo ***advance*** de la clase Parser, extraemos los valores ***command***, ***segment*** e ***index*** utilizando el metodo ***fields*** y el valor ***type*** con el metodo ***commandType*** de la clase ***Parser***, usamos un switch con el valor type y dependiendo del tipo de comando es que mandamos a llamar los metodos necesarios de la clase ***CodeWriter*** para traducir el comando. Ya se han descrito algunos de los metodos, a continuación se listan y explican los restantes.

#### CodeWriter
Se listan los nuevos metodos y se explica su función.

##### setFileName
Método sencillo para informar a la instancia que se inició la traducción de una nuevo archivo .vm, cambia el nombre del archivo que se está traduciendo para poder asignar los nombres de las funciones de con una combinación del nombre de la propia función y del nombre del archivo del que proviene, y así al traducirse las instrucciones, aun si hubiera una función con el mismo nombre en distintos archivos, para el programa en lenguaje ensamblador serían funciones distintas.
El unico parametro que recibe es fileName, que es el nombre que queremos asignar.

##### writeInit
Es el primer metodo que se llama y se utiliza una sola vez independientemente de cuantos archivos compongan nuestro programa completo.
Sirve para escribir las instrucciones de arranque, es decir, almacena las referencias inciales hacia nuestros segmentos de memoria de manera que se puedan comenzar a utilizar y llama a la función ***Sys.init*** que es una función que siempre debe escribirse, proviene de una archivo llamado ***Sys*** proveniente de System, y con llama su función ***init***, siempre debemos escribir esta instrucción pues es el punto de entrada de nuestro programa.
No recibe parametros.

##### writeLabel
Tiene una función sencilla pero muy importante, escribe en nuestro codigo ensamblador una etiqueta ***(label)*** y recibe como parametro el nombre que queremos ponerle a la etiqueta.

##### writeGoto
Igual que writeLabel es una función sencilla pero importante, se encarga de escribir las instrucciones en ensamblador para hacer un salto hasta la linea del codigo donde se encuentra la etiqueta del codigo que se quiere ejecutar, normalmente dicha etiqueta va a ser en representación de una función.
Recibe el nombre de la etiqueta a la que quiere hacerse el salto.

##### writeIf
Esta función escribe las instrucciones necesarias para hacer un salto solo si el ultimo valor de la pila es igual a ***true***, este valor sería equivalente a 1111111111111111 (16 unos seguidos) y ***false*** sería 0000000000000000 (16 ceros seguidos), la instrucción hace que el programa evalue si el valor es distinto de 0, pues 0 sería equivalente a ***false*** y si es distinto, debería ser true. 
Recibe como unico parametro el nombre de la etiqueta a la cual se quiere hacer el salto.

##### writeFunction
Está función lo que hace es preparar la memoria para una una función, crea la etiqueta y agrega a la pila registros vacíos como se requiera, en función de la cantidad de variables que requiera nuestra función. Al escribir una función en VM es necesario escribir el nombre de la función seguido de esta cantidad de variables.
Recibe como parametros el nombre de la función y el numero de variables. 

##### writeCall
Es de las funciones más complejas pues tiene que dejar preparada la memoria para llamar a otra función y proporcionarle su contexto limpio.
Al momento de escribir la instrucción en VM es necesario escribir el numero de argumentos que necesita la función.
Esto quiere decir que al momento de llamar, por ejemplo a una función que recibe 2 argumentos, se tendría que escribir de la forma ***call funtionName 2*** y esta sencilla instrucción va a resultar en un codigo ensamblador bastante largo, se prepara el stack actual para la función apartir de la posicón actual del puntero, si se reciben n argumentos, se usan n posiciones atrás de la ultima posición del puntero.
Se guardan los valores actuales de los segmentos ***THIS***, ***THAT***, ***ARG*** y ***SP***, con el fin de poder volver a estas posiciones después de terminar de ejecutar la función a la que se esta llamando, luego se actualizan esos punteros a la nueva posición que tendrá dentro de la memoria.
Se obtiene la posición del código donde inicia la función que queremos llamar, e inmediatamente se llama a hacer el salto incondicional.
```
    @functionName
    o;JMP
```
Inmediatamente después de esta llamada se crea una etiqueta que servirá para saber a donde hacer el salto para regresar al punto donde nos quedamos.
Si se llama a una función que este dentro de otro archivo, se obtiene el nombre del archivo y se agrega a un arreglo, del cuál después obtendremos los archivos que tenemos pendientes de interpretar. También se lleva un conteo de cuantas llamadas hemos hecho a distintas funciones, de manera que si llamamos en distintas ocasiones a la misma función, se puede identificar de forma fácil a que parte regresar gracias al numero de llamada.
Una funcionalidad que optimizaría más este proceso sería traducir el archivo primario completo y luego solo traducir las funciones que se utilicen dentro de otro archivo, no todas y así no hacer el programa más grande de lo necesario

##### writeReturn
Esta función de la maquina virtual se encarga de regresar la memoria a un estado en el que se pueda seguir ejecutando el codigo desde el cual se llamo a la función que esta realizando el return.
Por ejemplo, supongamos que tenemos una función llamada sum que realiza una suma de dos valores, por lo tanto dicha función recibirá dos argumentos (los dos valores que se van a sumar), asi que en nuestro VM language, antes de hacer la llamada a mult, tendríamos que hacer push de los dos valores al stack y después hacer la llamada, especificando que la función recibirá dos argumentos. De la siguiente manera:
```
    (init)
    push 5
    push 6
    call sum 2
```
Esto sería como se escribe en VM language, pero en Hack Assembler es mucho más complejo. Luego, la función sum sería de la forma:
```
    (sum) 2
    push arg 0
    push arg 1
    add
    return
```
(Son codigos de ejemplo y no reflejan como es en realidad el codigo de una función similar)
La función sum haría push de sus dos argumentos al stack, luego haría la suma, por lo que reemplazaría los dos valores por el resultado de su suma, luego al hacer return, se reemplazan los dos argumentos por el valor resultado de la función sum, entre otros procesos, como regresar los indices de los segmentos de memoria a los que se estaban trabajando antes de hacer la llamada, y seguir ejecutando la función principal desde donde se quedó. 

## Modulo 09 **High Level Language**

## Modulo 10 **Compiler I: Syntax Analysis**

En este modulo crearemos la primera parte de nuestro compilador, que se encargará de analizar la sintaxis de nuestros programas escritos en lenguaje Jack, nos aseguraremos de que entienda las instrucciones que nosotros escribirmos mediante una salida auxiliar en formato XML, pues no escribirá codigo VM hasta el siguiente modulo, donde programaremos el generador de codigo, que como su nombre lo indica, generará codigo a partir de las instrucciones que ya se hayan procesado por nuestri analizador de sintaxis.

Este proceso incluye ***Lexical Analysis***, ***Grammar***, ***Parse Trees***, ***Parser Logic***, ***The Jack Grammar***, para finalmente llegar a ***The Jack Analyzer***, que será implementado mediante las recomendaciones de los instructores. Todos estas partes se explicarán a continuación, conforme se vaya estudiando cada una y al final se explicará el analizador de sintaxis, una vez que haya sido implementado.

### JackTokenizer ###

Es la clase que se encarga de tokenizar linea por linea del programa Jack, tiene varios metodos, descritos a continuación.

#### constructor ####
Inicializa las variables necesarias para poder trabajar con el documento, asigna el contenido del documento a una variable estatica, inicializa un indice i y un j en 0 y en otra variable guarda la cantidad de lineas del programa.

#### hasMoreTokens ####
Devuelve un booleano, verdadero si hay más tokens que leer del programa y false de lo contrario, lo hace comparando el valor del indice i con la longitud del documento, así como el indice j con la longitud de la linea actual.

#### advance ####
Incrementa el valor del indice j en 1 mientras haya más tokens en la linea actual del documento o la devuelve a valor 0 e incrementa el indice i en 1, de manera que se pueda leer el siguiente token del documento.

#### tokenType ####
Es un getter que devuelve una constante dependiendo del tipo de token que se este evaluando actualmente.
Revisa en la lista de palabras reservadas, luego en la de simbolos para ver si pertenece a una de esas listas, luego analiza mediante expresiones regulares si la estructura del token coincide con la de una constante numerica, de texto o si es un identificador.