var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var port = 8080;
var config = require('./config');
var mongoose = require('mongoose');


mongoose.connect(config.db);
var datosModel = mongoose.model('datos',{
    titulo: String,
    imagen: String,
    precio: String,
    descuento: String,
    fechaVencimiento: String,
    tipo: String,
    Visitas: String,
    Url:String
});

function scrapTiticupon() {
    var urlTiti = "https://www.titicupon.com/titicupon";
    var urlCupones = 'https://www.titicupon.com/titicupon/lo-que-te-perdiste?page=';
    var url = urlTiti;
    var i = -1;
    while (i < 3) {
        request(url, function (err, resp, body) {
            console.log(url);
            if (err) {
                console.log("Hola mundo");
                console.log(err);
            } else {
                var $ = cheerio.load(body);
                $(".grid-item").each(function () {
                    var titulo = $(this).find('h4 a').text();
                    if(titulo!= "") {
                        var img = $(this).find('a img').attr("src");
                        var precio = $(this).find('b').text();
                        var descuento = $(this).find('.ahorro-small span').text();
                        var fechacaducidad = $(this).find('.date-display-single').text();
                        var tipo = $(this).find('.tag-icon').text();
                        var newTipo = tipo.replace(/([\n!-.])/g, '');
                        var newTitulo = titulo.replace(/([!.´])/g, '').toLowerCase();
                        var urlOferta = urlTiti + "/" + newTitulo.replace(/ /g, '-');
                        /*
                         var arreglo = {
                         nombre: titulo,
                         imagen: img,
                         precioA: precio,
                         descuento: descuento,
                         fechaVa: fechacaducidad,
                         tipo: newTipo,
                         url: urlOferta

                         };

                         console.log(arreglo);
                         */
                        var datos = new datosModel({
                            titulo: titulo,
                            imagen: img,
                            precio: precio,
                            descuento: descuento,
                            fechaVencimiento: fechacaducidad,
                            tipo: newTipo,
                            url: urlOferta
                        });

                        datos.save(function (error) {
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                });

            }
        });
        i++;
        url = urlCupones + i;

    }
}
//scrapTiticupon();

function scrapYuplon() {
    var url = "http://www.yuplon.com/";

    request(url, function (err, resp, body) {

        console.log(url);
        if (err) {
            console.log(err);
        } else {
            var $ = cheerio.load(body);
            $(".extra-campaign").each(function () {

                var titulo = $(this).find('.offer-small-title').text();
                if (titulo!= "") {
                    var lugar = $(this).find('div b').text();
                    var img = $(this).find('div img').attr("src");
                    var precio = $(this).find('.price').text();
                    var descuento = $(this).find('.discount').text();
                    var tipo = 'yuplon';
                    var date = new Date();
                    var fechacaducidad = date.getDate().toString() + "/" + (date.getMonth() + 1).toString() + "/" + date.getFullYear().toString();
                    var urlOferta = url + $(this).find('a').attr("href");
                    /*
                     var arreglo = {
                     nombre: titulo,
                     lugar:lugar,
                     imagen: img,
                     precioA: precio,
                     descuento: descuento,
                     fechaVa: fechacaducidad,
                     url: urlOferta

                     };

                     console.log(arreglo);
                     */
                    var datos = new datosModel({
                        titulo: titulo,
                        imagen: img,
                        precio: precio,
                        descuento: descuento,
                        fechaVencimiento: fechacaducidad,
                        tipo: tipo,
                        url: urlOferta
                    });

                    datos.save(function (error) {
                        if (error) {
                            console.log(error);
                        }
                    });
                }
            });
        }
    });

}


setInterval(scrapYuplon,3600000); //prueba de 10s cambiar 3600000 por 10000
setInterval(scrapYuplon,3600000); //prueba de 10s cambiar 3600000 por 10000

console.log("server running on "+ port);
app.listen(port);


