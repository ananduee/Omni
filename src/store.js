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
  focusNode() {
    // In case we can find this node we should directly focus it instead of 2 renders.
    var node = document.getElementById("id_" + this.id);
    if (node) {
      node.focus();
    } else {
      this.focused = true;
    }
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
    newNode.next = null;
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
    this.focusNode();
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
    this.addNextSiblingNode(newNode);
  }

  @action.bound
  addNextSiblingNode(newNode) {
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

  @action.bound
  moveToLeft() {
    var parent = this.parent;
    if (!parent.isRoot) {
      var previousNode = this.findPreviousNode();
      // if this node already has child nodes then move this node as it is.
      if (this.childrenRoot) {
        if (previousNode) {
          previousNode.next = this.next;
        } else {
          parent.childrenRoot = null;
        }
      } else {
        // else next node should be marked as childRoot.
        var nodeToMarkAsChild = this.next;
        var nodeToChangeParent = nodeToMarkAsChild;
        while (nodeToChangeParent != null) {
          nodeToChangeParent.parent = this;
          nodeToChangeParent = nodeToChangeParent.next;
        }
        this.childrenRoot = nodeToMarkAsChild;
        if (previousNode) {
          previousNode.next = null;
        } else {
          parent.childrenRoot = null;
        }
      }
      parent.addNextSiblingNode(this);
    }
  }

  @action.bound
  focusPreviousNode() {
    var previousNode = this.findPreviousNode();
    if (previousNode != null) {
      if (previousNode.childrenRoot != null) {
        // find last child of the previous node.
        var markedNode = previousNode.findLastChildNode();
        while (markedNode.childrenRoot != null) {
          markedNode = markedNode.findLastChildNode();
        }
        markedNode.focusNode();
      } else {
        previousNode.focusNode();
      }
    } else {
      // We need to mark parent node focused if parent is not root.
      this.parent.focusNode();
    }
  }

  @action.bound
  focusNextNode() {
    if (this.childrenRoot != null) {
      this.childrenRoot.focusNode();
    } else if (this.next != null) {
      this.next.focusNode();
    } else {
      // keep finding parent till they have next.
      var parent = this.parent;
      while (!parent.isRoot && parent.next == null) {
        parent = parent.parent;
      }
      if (parent && parent.next) {
        parent.next.focusNode();
      }
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

  @action.bound
  focusNode() {
    // root can't be focused.
  }

  @action.bound
  focusNextNode() {
    // do nothing as their is no next node.
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
