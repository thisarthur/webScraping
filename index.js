 
const axios = require ('axios');
const cheerio = require ('cheerio');
const fs = require ('fs');


//Site Pai que será extraido os dados!
const siteAlvo = 'https://sp.olx.com.br/imoveis'

const dados = [];
let totpgpai = 100
let count = 1


async function main(){   //percorrer paginas
    while (count <= totpgpai){
        const urlfilho = `https://sp.olx.com.br/imoveis?o=${count}`
       
  


//extrair código fonte do HTML pág Pai
const dadosBrutos = async () => {
    try {
        
        const res = await axios.get(urlfilho);
        return res.data;
        
    } catch (error) {
        console.log('Erro ao extrair dados brutos!: ' + error);
    }
};

//Extrair links da pág Pai
const listaLinks = async () => {
    const html = await dadosBrutos(); //recebe codigo fonte html de dadosBrutos
    const $ = await cheerio.load(html); //instancia cheerio
    $('.sc-12rk7z2-1').each(function(i, lnk){
        dados [i] = $(lnk).attr('href');
    }) 
    //seletor com a classe em que estao os links, each para percorrer a array, array dados recebendo os links

       return dados;
}

//Extrair dados do anúncio
const coletaDados = async(pg) =>{
  
    try {
        const res = await axios.get(pg); //axios pega o html da pág filho
        const html = res.data;              
        const $ = await cheerio.load(html); //instancia cheerio
        let nomeProduto = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.gyKyRK > div.h3us20-6.gFNxVM > div > div > h1').text()
        let valor = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.cpscHx > div.h3us20-6.jUPCvE > div > div > div.sc-hmzhuo.dtdGqP.sc-jTzLTM.iwtnNi > div.sc-hmzhuo.sc-12l420o-0.kUWFYY.sc-jTzLTM.iwtnNi > h2.sc-ifAKCX.eQLrcK').text()
        let publi = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.gyKyRK > div.h3us20-6.hzUJDA > div > div > div > span.sc-1oq8jzc-0.jvuXUB.sc-ifAKCX.fizSrB').text()
        let anunciante = $('#miniprofile > div > div > div > div.sc-cbMPqi.eTGDLQ.sc-jTzLTM.iwtnNi > div > span').text()
            //var com os querry retornando as informações pedidas

        const resultado = `
        Produto:${nomeProduto}
        Valor:${valor}
        Anunciante:${anunciante}
        ${publi}
        Link: ${pg}
        `
        
        gravaTXT(resultado);
           
          
    } catch (error) {
        console.log('Problema na extração de dados: ' + error);
    }
};

//Cria um txt e coloca os valores extraídos
const gravaTXT = async (result) => {
    fs.appendFile('fisgar.txt', result, {flag: 'a+'}, function(err){
        if(err)
        console.log('Erro na geração TXT: ' +err)
    })
}
const apresentaDados = async () =>{
    const todosLnks = await listaLinks(); //var recebendo todos os links gerados
    todosLnks.map(function(linksFilhos){ 
        coletaDados(linksFilhos);
    }) //percorrendo todos os links com a funcao coletaDados
};


//const principal chamando a ultima funcao com resultado
const pgn = async () =>{
    await apresentaDados()
        
   }

   pgn();

   await coletaDados(urlfilho)
   count ++

}
}

//chamada de método
main();
