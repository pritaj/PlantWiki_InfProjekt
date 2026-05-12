# 🌿 PlantWiki – Növényes Webplatform

Egy teljes körű Node.js-alapú webalkalmazás, amely egyesíti a növényadatbázist, webshopot, tápanyag-kalkulátort és gondozási wikit egyetlen modern platformon.

---

## ✨ Funkciók

- Növényadatbázis CRUD
- Webshop
- Tápanyag-kalkulátor
- Gondozási Wiki
- JWT autentikáció

---

## 🛠️ Technológiai stack

| Réteg            | Technológia        |
| ---------------- | ------------------ |
| **Backend**      | Node.js            |
| **Adatbázis**    | MySQL / PostgreSQL |
| **ORM**          | Sequelize          |
| **Autentikáció** | JWT + bcrypt       |
| **Sablonmotor**  | EJS                |
| **Emailek**      | Nodemailer         |

---

## 🌐 API végpontok

| Metódus | Végpont                    | Leírás                  |
| ------- | -------------------------- | ----------------------- |
| GET     | `/api/plants`              | Összes növény listázása |
| POST    | `/api/plants`              | Új növény hozzáadása    |
| GET     | `/api/shop/products`       | Termékek listázása      |
| POST    | `/api/shop/checkout`       | Rendelés leadása        |
| POST    | `/api/nutrients/calculate` | Tápanyag kalkulátor     |
| GET     | `/api/wiki`                | Wiki cikkek listázása   |
| POST    | `/api/auth/login`          | Bejelentkezés           |
| POST    | `/api/auth/register`       | Regisztráció            |

---

## 🗓️ Fejlesztési terv

- [ ] Projekt struktúra felállítása
- [ ] Adatbázis tervezés
- [ ] Autentikáció (regisztráció, login, JWT)
- [ ] Növény CRUD + admin felület
- [ ] Webshop alap funkciók (termékek, kosár)
- [ ] Tápanyag modul és kalkulátor
- [ ] Gondozási wiki (cikkek, betegségek)
- [ ] Reszponzív frontend
- [ ] Deployolás

---
