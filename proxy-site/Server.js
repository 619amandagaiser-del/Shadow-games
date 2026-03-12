import express from "express"
import fetch from "node-fetch"
import { JSDOM } from "jsdom"

const app = express()

app.use(express.static("public"))

function rewriteHTML(html, baseURL) {

const dom = new JSDOM(html)
const document = dom.window.document

document.querySelectorAll("a").forEach(link=>{
let href = link.getAttribute("href")
if(href && !href.startsWith("http")){
link.href = "/proxy?url=" + encodeURIComponent(new URL(href, baseURL))
}
})

document.querySelectorAll("img,script,link").forEach(el=>{
let src = el.src || el.href
if(src){
if(el.src) el.src = "/proxy?url=" + encodeURIComponent(src)
if(el.href) el.href = "/proxy?url=" + encodeURIComponent(src)
}
})

return dom.serialize()
}

app.get("/proxy", async (req,res)=>{

let target = req.query.url

if(!target){
return res.send("No URL")
}

try{

const response = await fetch(target,{
headers:{
"user-agent":"Mozilla/5.0"
}
})

let contentType = response.headers.get("content-type")

if(contentType.includes("text/html")){

let html = await response.text()

html = rewriteHTML(html,target)

res.send(html)

}else{

const buffer = await response.arrayBuffer()

res.set("content-type",contentType)

res.send(Buffer.from(buffer))

}

}catch(err){

res.send("Proxy error: "+err.message)

}

})

app.listen(3000,()=>{
console.log("Proxy running on http://localhost:3000")
})
