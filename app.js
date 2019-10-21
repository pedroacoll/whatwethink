$(document).ready(function() {

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    //Revisar
    //Antes se te quedaba en negro porque la mÃ¡xima lejanÃ­a que tenÃ­as era 200, y el plano ya se encontraba a -100. Por tanto tenÃ­as
    //muy poco rango de zoom. Si cambiamos el 200 por 2000, por ejemplo, ya podremos hacer zoom sin perder el plano de vista
    //var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200);
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);

    camera.position.z = 50; //distancia hacia tÃ­.

    scene.add(camera);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); //el renderer es como el canvas alpha false te deja la pantalla en negro
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement); //ponerlo siempre

    //ekl color de la luz da la sombra al objeto
    var ambientLight = new THREE.AmbientLight(0xdddddd); //se escriben e hexadecimal con 0x deante
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); //color, intensidad, siempre ,mmira al centro
    directionalLight.position.set(-20, 30, 30);
    scene.add(directionalLight);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    $(window).on('resize', onWindowResize);

    function onWindowResize(event){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }




    $("#form").on("submit", function(e) {
        //Evitamos que se envÃ­e el formulario
        e.preventDefault();

        //Obtenemos el valor en la caja de texto de nuestro formulario
        var value = $("#text").val();

        //Separamos el string en funciÃ³n de los espacios y nos quedamos con el Ãºltimo valor.
        value = value.split(' ');
        value = value.pop();
        console.log(value+"pop");

        //Borramos los saltos de linea para evitar problemas en la peticiÃ³n de ajax
        value.replace(/\r?\n|\r/g, '');
        console.log(value);

        //Llamamos a la funciÃ³n loadAjax con el parÃ¡metro obtenido que es la Ãºltima palabra que se ha escrito
        loadAjax(value, scene, layout, geoplane, verticerandom);
        console.log(value);
    })

    //Comprobamos las teclas que se estÃ¡n pulsando y enviamos la informaciÃ³n cuando esa tecla sea la barra espaciadora
    $("#text").on("keypress", function(e) {
        //console.log(e.originalEvent.code);
        if (e.originalEvent.code == "Space") {
            $("#form").submit();

        }
        if (e.originalEvent.code == "Enter") {
            $(".inst-image").remove();


            //Revisar
            //Para que verticerandom tenga un nuevo random cada vez que pulsamos Enter debemos asignarle un nuevo valor
            //a la variable, simplemente ejecutando la misma linea con la que se lo asignamos inicialmente
            //La posiciÃ³n en z del geoplano base es -100 mientras que las geofrases son 0, 1, 2...
            //Para posicionarlo con pegados al plano, en loadAjax, cuando hacemos el index * 1 o el nÃºmero que sea que queramos de distancia
            //le restaremos -100 para que quede pegado al plano. 
            //Cada vez que pulsemos Enter deberemos tambiÃ©n resetear el valor del index por el que multiplicamos la distancia en z.
            verticerandom = Math.floor(layout.geometry.vertices.length * Math.random());
            index = 0;
        }
    })

    var geoplane = new THREE.PlaneGeometry(224, 112, 64, 32);

    /*for (var i = 0; i < geoplane.faces.length; i++) {

        var face = geoplane.faces[i];
        face.color.setHex(Math.random() * 0xffffff);

    }
    var layout = new THREE.Mesh(geoplane, new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors }));*/


    var matTransp = new THREE.PointsMaterial();

    var layout = new THREE.Points(geoplane, matTransp);

    layout.position.set(0, 0, -20);
    scene.add(layout);
    render();

    var verticerandom = Math.floor(layout.geometry.vertices.length * Math.random());

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        controls.update();
    }

    /*var dotGeometry = layout.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    var dotMaterial = new THREE.PointsMaterial({ size: 1, sizeAttenuation: true });
    var dot = new THREE.Points(dotGeometry, dotMaterial);
    scene.add(dot);
    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);*/
})

//FunciÃ³n para cargar la pÃ¡gina del hashtag y obtener la primera imÃ¡gen que nos devuelve.
//Instagram carga el contenido con javascript de manera que no podemos acceder directamente a la imagen
//y debemos hacerlo a travÃ©s del script que lo cargarÃ¡


var index = 0;


function loadAjax(tag, scene, layout, geoplane, verticerandom ) {
    console.log(tag);
    $.ajax({
        url: 'https://www.instagram.com/explore/tags/' + tag,
        success: function(data) {
            const $data = $(documentHtml(data));
            const $dataBody = $data.find('.document-body:first');
            const $scripts = $dataBody.find('.document-script');
            const result = JSON.parse($($scripts[0]).text().replace('window._sharedData = ', '').replaceAll(';', ''));
           
            const img = result.entry_data["TagPage"][0];

            console.log(img);
            console.log(img.graphql.hashtag);
            console.log(img.graphql.hashtag.profile_pic_url);
            const imagen = img.graphql.hashtag.profile_pic_url;
            console.log(imagen);
            const newImg = `<img class="inst-image" src="${imagen}" />`;
            $("body").append(newImg);
            var frase1 = new THREE.PlaneGeometry(2, 2, 1);
            var testMap = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(imagen) });
            var geofrase = new THREE.Mesh(frase1, testMap);
            scene.add(geofrase);

            //Revisar
            //AquÃ­ es donde restamos 100 para que las geofrases se posicionen justo enfrente del plano
            geofrase.position.z = -20 + (index * 2);
            console.log(Math.floor(geofrase.position.z));
            index++;
            //console.log(Math.floor(layout.geometry.vertices.length * Math.random()));
            //var verticerandom = layout.geometry.vertices[Math.floor(Math.random()*layout.geometry.vertices.length)];
            //geofrase.position.x = verticerandom.x
            //geofrase.position.y = verticerandom.y
            geofrase.position.x = layout.geometry.vertices[verticerandom].x
            geofrase.position.y = layout.geometry.vertices[verticerandom].y
            /*for (var i = 0; i < layout.geometry.vertices.length; i++) {
                var verticerandom = layout.geometry.vertices[i];
                geofrase.position.x = layout.geometry.vertices[verticerandom].x
                geofrase.position.y = layout.geometry.vertices[verticerandom].y
            }*/
            /*geofrase.lookAt(raycaster);*/
        },
    })
}



//FunciÃ³n para formatear la pÃ¡gina recibida a travÃ©s de ajax
const documentHtml = function(html) {
    const result = String(html)
        .replace(/<!DOCTYPE[^>]*>/i, '')
        .replace(/<(html|head|body|title|meta|script)([\s>])/gi, '<div class="document-$1"$2')
        .replace(/<\/(html|head|body|title|meta|script)>/gi, '</div>');
    return $.trim(result);
};

//FunciÃ³n para reemplazar todas las ocurrencias de la bÃºsqueda en el string. 
//El mÃ©todo .replace() solo remplaza la primera. 
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};