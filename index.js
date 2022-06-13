const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const { olxAnnouncementSelector: { productName, value, publicationData, announcementName } } = require('./botConfig');

//percorrer páginas
async function main() {
    let numPag = 100
    let count = 1

    while (count <= numPag) {
        const url = `https://sp.olx.com.br/imoveis?o=${count}`

        //extrair código fonte e links do HTML pág Alvo
        async function getLinksOnThePage() {
            try {
                const res = await axios.get(url);
                const html = await res.data;
                const $ = await cheerio.load(html);

                const links = []
                $('.sc-12rk7z2-1').each(function (i, lnk) {
                    links[i] = $(lnk).attr('href');
                })
                links.forEach(function (allLinks) {
                    getPageContent(allLinks)
                })
                //seletor com a classe em que estao os links, each para percorrer a array, array links recebendo os links
                //forEach percorrendo todos os links chamando a funcao getpagecontent
                return links;

            } catch (error) {
                console.log('Erro ao gerar links!: ' + error);
            }};

        //Extrair dados do anúncio
        async function getPageContent(announcementLink) {
            try {
                const res = await axios.get(announcementLink); //axios pega o html dos links extraidos
                const html = res.data;
                const $ = await cheerio.load(html); //instancia cheerio

                //obj puxando seletores do botconfig
                announcement = {
                    productName: $(productName).text(),
                    value: $(value).text(),
                    publicationData: $(publicationData).text(),
                    announcementName: $(announcementName).text()
                }

                //const aninhando dados para serem impressos.
                const printAnnouncement = `
                    Produto:${announcement.productName}
                    Valor:${announcement.value}
                    Anunciante:${announcement.announcementName}
                    ${announcement.publicationData}
                    Link: ${announcementLink}
                    `
                WriteToFile(printAnnouncement);

            } catch (error) {
                console.log('Problema na extração de dados: ' + error);
            }};

        //Cria um txt e coloca os valores extraídos
        async function WriteToFile(content) {

            fs.appendFile('fisgar.txt', content, { flag: 'a+' }, function (err) {
                if (err)
                    console.log('Erro na geração TXT: ' + err)
            })}
        await getLinksOnThePage()
        await getPageContent(url)

        count++
    }}
main();