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
Utilizamos un arreglo 'ariLogCommands' que contiene todas las intrucciones que denotan una operación aritmetica o logica (add, sub, neg, eq, gt, lt, and, or, not), un objeto 'commands' que son todos los comandos que no son logicos o aritmeticos (pop, push, label, goto, if-goto, function, call, return) y tienen un valor asociado que es como identificaremos que instrucción es cuando aparezca en el codigo, aunque esn este modulo solo utilizaremos 'pop' y 'push' para poder hacer las operaciones.
También tenemos un objeto 'locations': 
```
let locations = {
    local: 'LCL',
    argument: 'ARG',
    this: 'THIS',
    that: 'THAT',
}
```
'locations' incluye los segmentos de memoria donde podemos guardar los valores de las operaciones que realicemos.

El programa tiene como punto de entrada la función main. Como encargado de escribir el codigo ensamblador tenemos la clase CodeWriter y para interpretar las instrucciones tenemos la clase Parser.
main es una función unica que se encarga de llamar una instancia de la clase parser, extraer de ahí la instrucción y sus parametros y luego utiliza una instancia de la clase CodeWriter para escribir el comando en ensamblador según corresponda.

#### Parser 
Tiene un constructor que recibe el archivo del cual se extraerán las instrucciones. Tiene un metodo 'hasMoreCommands' que nos dice si hay más comandos en el archivo y así saber si continuaremos con el proceso o debemos terminar, así evitamos error en la ejecución del programa.
Tenemos el metodo 'advance' que lee el siguiente comando valido en el archivo y lo guarda.
Está el metodo 'commandType' que nos dice el tipo del comando actual (el que está guardado).
Y tenemos el metodo 'fields', que regresa en un arreglo los segmentos de la instrucción actual, que serían el comando en si, en que segmento de la memoria se va a guardar y el indice de ese segmento.

#### CodeWriter
Tiene un constructor que recibe la referencia al archivo de salida (donde escribirá los comandos traducidos) y el nombre del archivo que se está leyendo.
Tiene un metodo 'writeAritmetic' que se encarga de escribir el codigo en lenguaje ensamblador según la instrucción aritmetica o lógica recibida. unicamente recibe el comando.
Tiene un metodo 'writePushPop' que escribe en lenguaje ensamblador las intrucciones de tipo push/pop. Recibe el comando, el segmento y el indice.
Y tiene el metodo 'close' que sirve para cerrar el archivo en el que se está escribiendo y así evitar errores en la ejecución del programa.

Cabe aclarar que la importancia de todos estos metodos radica en que no solo es traducir una palabra por otra, cada instrucción de la maquina virtual equivale a varias instrucciones en lenguaje ensamblador.
Por ejemplo para hacer un push, tenemos que apuntar la dirección de memoria hacia el siguiente espacio vacío en la pila, luego insertar el valor, luego aumentar el indice para apuntar al siguiente espacio vacío para dejarlo listo para hacer otra operación. 
Para hacer operaciones aritmeticas como la suma, tenemos que hacer pop del ultimo valor en la pila, almacenarlo en algún lado temporalmente, hacer pop del siguiente valor en la pila, hacer la operación con ambos valores, y hacer push del resultado en el mismo espacio de memoria donde estaba el segundo valor que utilizamos.
Y así ocurre con distintas instrucciones, que además de que ya es más largo explicarlo que escribir la instrucción, traducir todo eso a lenguaje ensamblador ocupa aun muchisimas más lineas de codigo.

Para probarlo se nos proporcionan archivos .vm que debemos traducir a archivos .asm, la Hack Computer que nos proporcionan en el curso ya tiene la capacidad de intrepetar estos archivos sin necesidad de pasarlos a instrucciones binarias.
Debemos ejecutar el programa junto con el archivo .tst (archivos de prueba) correspondiente y este se encargará de extraer un archivo .out (las salidas del programa, o en este caso pasa a un archivo los registros de memoria criticos para analizar el comportamiento de nuestro programa).
Este archivo .out lo compara con otro archivo proporcionado .cmp y si son iguales significa que el programa se tradujo exitosamente.
Tenemos pruebas basicas, pruebas de acceso a la memoria, de puntero y estaticas, así como pruebas de Aritmetica de pila, que incluyen suma y la prueba de la pila.

