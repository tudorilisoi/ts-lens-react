import ReactDOM from 'react-dom';

import {SHA256} from 'crypto-js'
import {getElement, LensContext} from "@phil-rice/lens";
import {ComponentFromServer, LoadAndCompileCache, MakeComponentFromServer} from "@phil-rice/codeondemand";
import React from "react";
import {CpqData, CpqDomain} from "./CpqDomain";
import {Nav} from "@phil-rice/nav";


let cache = LoadAndCompileCache.create<MakeComponentFromServer<React.ReactElement>>((s: string) => SHA256(s).toString())

let cpqDomain: CpqDomain = new CpqDomain(cache)
let element = getElement('root')


function fetchData(url: string): Promise<CpqData> { return fetch(url).then(r => r.json())}

fetch("created/index.json").then(j => j.json()).then(indexJson => {
    let jsonFiles: string[] = indexJson.jsonFiles
    console.log("fetched for nav", indexJson, jsonFiles)
    function setJson(cpqData: CpqData) {
        console.log("setJson", cpqData)
        cache.loadFromBlob(cpqData).then(() =>
            LensContext.setJsonForReact<CpqDomain, CpqData>(cpqDomain, 'cpq',
                c => ReactDOM.render(
                    <div>
                        <Nav jsonFiles={jsonFiles} fetch={fetchData} setData={setJson}></Nav>
                        <ComponentFromServer context={c}/>
                    </div>, element))(cpqData))
    }
    fetchData(jsonFiles[0]).then(setJson)
})


