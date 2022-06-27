//node Hackerrank_Automation.js --url=https://www.hackerrank.com --config=config.json
//npm install minimist
//npm install puppeteer

let minimist=require("minimist");
let fs=require("fs");
let puppeteer=require("puppeteer");

let args=minimist(process.argv);
let configJSON=fs.readFileSync(args.config,"utf-8");
let config=JSON.parse(configJSON);

run();

async function run(){ 
    let browser=await puppeteer.launch({headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport:null
        // with defaultViewport content inside it is maximised and with start-maximised the window gets opened maximised
    });
    let pages=await browser.pages();
    let page=pages[0];

    await page.goto(args.url);

    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']",config.userid,{delay: 50});

    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']",config.password,{delay: 50});
    //click on login3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");
    //click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");
    //click on Manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");
    //find number of pages
    await page.waitForSelector("a[data-attr1='Last']");
    let numPage=await page.$eval("a[data-attr1='Last']",function(atag){
        let totpages=parseInt(atag.getAttribute("data-page"));
        return totpages;
    });
    console.log(numPage);
    //find all urls of page
    for(let i=0;i<numPage;i++){
        await handlePage(browser,page);
    }
    
};

async function handlePage(browser,page){
        //do some code
        await page.waitForSelector("a.backbone.block-center");
        let curls=await page.$$eval("a.backbone.block-center",function(atags){
        let iurls=[];
        for(let i=0;i<atags.length;i++){
            let iurl=atags[i].getAttribute("href");
            iurls.push(iurl);
        }
        return iurls;
    });
    for(let i=0;i<curls.length;i++){
        await handleContests(browser,page,curls[i]);
    }
    //move to next page

    await page.waitFor(2000);
    await page.waitForSelector("a[data-attr1='Right']");
    await page.click("a[data-attr1='Right']");
    
}

async function handleContests(browser,page,curl){
    let npage=await browser.newPage();
    await npage.goto(args.url+curl);
    await npage.waitFor(2000);

    await npage.waitForSelector("li[data-tab='moderators']");
    await npage.click("li[data-tab='moderators']");

     for(let i=0;i<config.moderators.length;i++){
        let moderator=config.moderators[i];

        await npage.waitForSelector("input#moderator");
        await npage.type("input#moderator",moderator, {delay:50});

        await npage.keyboard.press("Enter");
     }
        await npage.waitFor(1000);
        await npage.close();
        await npage.waitFor(2000);
        
}