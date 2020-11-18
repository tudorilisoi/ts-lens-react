import React from "react";


import {RestContext} from "./LoadAndCompileCache";
import {ReactRest} from "./reactRest";
import {Lens} from "./utils";

//Why all the messing around with 'Element' instead of just using React.Element
//The answer is threefold
//* Decouple from the react libary: we use literally none of the properties when it's just Element
//* This allows us to use the same library with multiple versions of React. So we have stepped off the 'must increment the version number' ladder
//* We are forced to document through code the properties we use from the React library rather than simply bind ourselves to an unknown number of them
//* The cost is usually just in the main method where we have to dependency inject the version of react we use once.
//
//What is 'domain' about?
//It's to control scope / do dependency ibjection. The domain is the 'facard' to all the 'things' a component might need
//In the demo example it has lens,and that is probably a very comon thing
//Other things might include datasources or other otherwise 'global' things

export interface RestRootProperties<Element, Domain, Main> {
    reactRest: ReactRest<Element>;
    mainJson: Main;
    domain: Domain
    setMainJson: (main: Main) => void
}
export interface CreateRestFn<Element, Domain, Main, Child> {
    (restProperties: RestProperties<Element, Domain, Main, Child>, props: any): Element
}
export interface HasRestProperties<Element, Domain, Main, Child> {
    rest: RestProperties<Element, Domain, Main, Child>
}
export class RestProperties<Element, Domain, Main, Child>  {
    restRoot: RestRootProperties<Element, Domain, Main>
    lens: Lens<Main, Child>;

    constructor(restRoot: RestRootProperties<Element, Domain, Main>, lens: Lens<Main, Child>) {
        this.restRoot = restRoot
        this.lens = lens
    }
    withLens<NewChild>(lens: Lens<Child, NewChild>): RestProperties<Element, Domain, Main, NewChild> {return new RestProperties(this.restRoot, this.lens.andThen(lens))}
    json() {return this.lens.get(this.restRoot.mainJson)}
    setJson(child: Child) {
        console.log("setJson", child)
        let newMain = this.lens.set(this.restRoot.mainJson, child);
        console.log("newMain", newMain)
        this.restRoot.setMainJson(newMain)}
}

/** The top level component */
export function RestRoot<Element, Domain, Main>(props: RestRootProperties<Element, Domain, Main>) {
    let rest = new RestProperties(props, Lens.identity())
    return props.reactRest.renderSelf({rest: rest})
}

/** This represents a rest element that is rendering a part of the json 'Main'. The part it is rendering is 'Child'.
 * Example Main might be an order and Child might be the field representing 'an order item'
 */
export function Rest<Element, Domain, Main, Child>(rest: HasRestProperties<Element, Domain, Main, Child>) {
    let actualRest = rest.rest
    // console.log("Rendering Rest", actualRest)
    return actualRest.restRoot.reactRest.renderSelf(rest)
}


export interface HasRestChildProperties<Element, Domain, Main, Parent, NewChild> {
    rest: RestProperties<Element, Domain, Main, Parent>
    lens: Lens<Parent, NewChild>
    render: string
    [x: string]: any
}

/** This represents a rest element that is rendering a part of the json 'Main'. The part it is rendering is 'Child'.
 * Example Main might be an order and Child might be the field representing 'an order item'
 */
export function RestChild<Element, Domain, Main, Parent, Child>(props: HasRestChildProperties<Element, Domain, Main, Parent, Child>) {
    // console.log("Rendering RestChild", props)
    let parentRest = props.rest
    let j = parentRest.json()
    let reactRest = parentRest.restRoot.reactRest;
    let renderUrl = reactRest.renderUrl(props.render, j)
    let childRest: RestProperties<Element, Domain, Main, Child> = parentRest.withLens(props.lens)
    return reactRest.renderUsingUrl(renderUrl, {...props, rest: childRest})
}

