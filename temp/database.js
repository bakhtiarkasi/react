import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("little_lemon");

export async function createTable() {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          "create table if not exists menuitems (id integer primary key not null, name text, price text, description text, image text, category text);"
        );
      },
      reject,
      resolve
    );
  });
}

export async function getMenuItems() {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql("select * from menuitems", [], (_, { rows }) => {
        resolve(rows._array);
      });
    });
  });
}

export function saveMenuItems(menuItems) {
  // Use parameterized inserts for safety and proper escaping
  db.transaction(tx => {
    menuItems.forEach(item => {
      tx.executeSql(
        `insert into menuitems (id, name, price, description, image, category) values (?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.price, item.description, item.image, item.category]
      );
    });
  });
}

export async function filterByQueryAndCategories(query, activeCategories) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Build placeholders for the IN clause and bind parameters
      const placeholders = activeCategories.map(() => '?').join(',');
      const sql = `select * from menuitems where name like ? and category in (${placeholders})`;
      const params = [`%${query}%`, ...activeCategories];
      tx.executeSql(
        sql,
        params,
        (_, { rows }) => {
          resolve(rows._array);
        }
      );
    }, reject);
  });
}
