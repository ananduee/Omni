import { observable, action, computed, toJS } from "mobx";

class ItemNode {
  id = Math.random();
  @observable title;
  @observable parent;
  @observable next;
  @observable focused;
  @observable childrenRoot = null;

  constructor(title) {
    this.title = title;
  }

  @action.bound
  setTitle(title) {
    this.title = title;
  }

  @action.bound
  removeFocusFromNode() {
    this.focused = false;
  }

  @action.bound
  addChild(title) {
    var newNode = new ItemNode(title);
    this.addChildNode(newNode);
  }

  @action.bound
  addChildNode(newNode) {
    newNode.parent = this;
    newNode.focused = true;
    if (this.childrenRoot == null) {
      this.childrenRoot = newNode;
    } else {
      var lastNode = this.findLastChildNode();
      lastNode.next = newNode;
    }
  }

  @action.bound
  toggleStrikeOut() {
    if (this.title.startsWith("<s>") && this.title.endsWith("</s>")) {
      this.title = this.title.slice(3, this.title.length - 4);
    } else {
      this.title = "<s>" + this.title + "</s>";
    }
  }

  @action.bound
  setNextNode(nextNode) {
    this.next = nextNode;
    this.focused = true;
  }

  @action.bound
  setChildRoot(childRoot) {
    this.childrenRoot = childRoot;
    this.focused = true;
  }

  @action.bound
  deleteNode() {
    var prev = this.findPreviousNode();
    if (prev != null) {
      prev.setNextNode(this.next);
    } else {
      // in case next node exists it should be made root of parent
      // if both prev and next is missing. this means parent child needs to be made null.
      this.parent.setChildRoot(this.next);
    }
  }

  @action.bound
  addNextSibling() {
    var newNode = new ItemNode("");
    newNode.focused = true;
    newNode.parent = this.parent;
    newNode.next = this.next;
    this.next = newNode;
  }

  @action.bound
  moveToRight() {
    var previousNode = this.findPreviousNode();
    if (previousNode != null) {
      previousNode.next = this.next;
      previousNode.addChildNode(this);
    }
  }

  findLastChildNode() {
    var lastNode = this.childrenRoot;
    while (lastNode.next != null) {
      lastNode = lastNode.next;
    }
    return lastNode;
  }

  findPreviousNode() {
    if (this.isNodeRoot()) {
      return null;
    } else {
      var previous = this.parent.childrenRoot;
      while (previous.next != this) {
        previous = previous.next;
      }
      return previous;
    }
  }

  isNodeRoot() {
    return this.parent.childrenRoot == this;
  }
}

class RootNode extends ItemNode {
  isRoot = true;

  constructor(title) {
    super(title);
  }

  @action.bound
  setChildRoot(childRoot) {
    // Child of root node should not be allowed to be null
    if (childRoot != null) {
      super.setChildRoot(childRoot);
    }
  }
}

export default class WorkDocument {
  @observable root;

  constructor() {
    this.root = new RootNode("");
  }

  @action.bound
  addItem(title) {
    this.root.addChild(title);
  }

  convertToJs() {
    return toJS(this);
  }
}
