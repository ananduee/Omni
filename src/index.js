import React from "react";
import DevTools from "mobx-react-devtools";
import { render } from "react-dom";
import WorkDocument from "./store";
import View from "./view";

var firstRun = true;

var store = new WorkDocument();
store.addItem("This is first item.");

render(
  <div>
    <DevTools />
    <View store={store} />
  </div>,
  document.getElementById("root")
);

window.store = store;
