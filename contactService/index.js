// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// Feel free to add files as necessary

export default class {
  constructor(updates, service) {
    this.contacts = [];
    this.service = service;

    updates.on("add", this.contactAdd.bind(this));
    updates.on("change", this.contactChanged.bind(this));
    updates.on("remove", this.contactRemoved.bind(this));
  }

  contactAdd(id) {
    this.service.getById(id).then((result) => {
      this.contacts.push(result);
    });
  }

  getPhoneNumber(p1, p2) {
    let phones = [];

    if (p1) {
      phones.push(this.formatPhone(p1));
    }

    if (p2) {
      phones.push(this.formatPhone(p2));
    }

    return phones;
  }

  formatPhone(phone) {
    let temp = phone.split("-");
    if (temp.length >= 3) {
      return `(${temp[0]}) ${temp[1]}-${temp[2]}`;
    } else {
      if (phone.indexOf("+1") == 0) {
        return `(${phone.substring(2, 5)}) ${phone.substring(
          5,
          8
        )}-${phone.substring(8, phone.length)}`;
      } else {
        return `(${phone.substring(0, 3)}) ${phone.substring(
          4,
          7
        )}-${phone.substring(7, phone.length)}`;
      }
    }
  }

  contactChanged(id, field, value) {
    this.contacts.map((contact) => {
      if (contact.id === id) {
        contact[field] = value;
      }
      return contact;
    });
  }

  contactRemoved(id) {
    this.contacts = this.contacts.filter((contact) => contact.id !== id);
  }

  getFormattedResult(result) {
    const contact = {
      name:
        result.nickName.length > 0
          ? `${result.nickName} ${result.lastName}`
          : `${result.firstName} ${result.lastName}`,
      phones: this.getPhoneNumber(
        result.primaryPhoneNumber,
        result.secondaryPhoneNumber
      ),
      email: result.emailAddress || result.primaryEmail || "",
      address: result.address || "",
      role: result.role || "",
      id: result.id,
    };
    return contact;
  }

  normalizeText(string) {
    return string
      .replace(/ /g, "")
      .replace(/-/g, "")
      .replace("+", "")
      .replace("(", "")
      .replace(")", "");
  }

  search(query) {
    let result = [];
    result = this.contacts.filter((contact) => {
      let flag = false;
      for (const key in contact) {
        if (key.toLowerCase().indexOf("phone") > -1) {
          let p = this.normalizeText(contact[key]);
          let newquery = this.normalizeText(query);

          if (p.indexOf(newquery) > -1) {
            flag = true;
            break;
          }
        } else if (
          `${contact.firstName} ${contact.lastName}` == query ||
          `${contact.nickName} ${contact.lastName}` == query
        ) {
          flag = true;
          break;
        } else if (contact[key] && contact[key].indexOf(query) >= 0) {
          flag = true;
          break;
        }
      }
      return flag;
    });

    return result.map((r) => this.getFormattedResult(r));
  }
}
