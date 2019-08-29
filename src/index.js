import React from "react";
import { autorun, set } from "mobx";
import { render } from "react-dom";
import WorkDocument from "./store";
import View from "./view";

var firstRun = true;

var store = new WorkDocument();
store.addItem("This is first item.");

render(<View store={store} />, document.getElementById("root"));

window.store = store;
