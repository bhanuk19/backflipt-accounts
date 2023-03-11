import cors from "cors";
import connection from "./modules/connection.js";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
const saltRounds = 10;
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import User from "./schemas/userSchema.js";
import SessionScheme from "./schemas/sessionSchema.js";
import sessionSchema from "./schemas/sessionSchema.js";
import { log } from "console";
import userSchema from "./schemas/userSchema.js";
const app = express();
let _db = null;
const PORT = 3050;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "vishnureddy05011",
    saveUninitialized: true,
    cookie: { httpOnly: true },
    resave: true,
  })
);
// connection.connectToDb((err) => {
//   if (err) return;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/login.html");
});
app.get("/health", (req, res) => {
  let health = {};
  if (connection) {
    health["dbstatus"] = "healthy";
  } else {
    return [true, false];
  }
  res.send([true, health]);
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  console.log("user logged out!!");
  res.send("user logged out!!");
});

// data.save();
const checkPass = async (incoming, hash) => {
  // console.log(incoming, hash);
  bcrypt.compare(incoming, hash, function (err, result) {
    // console.log(result);
    return result;
  });
};

app.post("/user_login", async (req, res) => {
  try {
    User.findOne({ username: req.body.username }, async (err, doc) => {
      if (err) {
        res.send(false);
      } else {
        if (req.body.password === "") {
          res.send(false);
        } else {
          if (await bcrypt.compare(req.body.password, doc.password)) {
            SessionScheme.findOneAndUpdate(
              { username: req.body.username },
              { updatedAt: new Date() },
              { new: true },
              (err, sesDoc) => {
                if (sesDoc) {
                  let data = {
                    session_id: sesDoc.session_id,
                    from: req.body.from,
                    username: sesDoc.username,
                    role: sesDoc.role,
                  };
                  res.status(200).send(data);
                } else {
                  req.session.session_id = req.sessionID;
                  req.session.username = req.body.username;
                  let newSession = new SessionScheme({
                    ...req.session,
                    role: doc.admin,
                  });
                  newSession.save((err, newSes) => {
                    let data = {
                      session_id: newSes.session_id,
                      from: req.body.from,
                      username: doc.username,
                      role: newSes.role,
                    };
                    res.status(200).send(data);
                  });
                }
              }
            );
          }
        }
      }
    });
  } catch (err) {
    request.send(false);
  }
});
app.post("/checkAuth", (req, res) => {
  sessionSchema.findOne({ session_id: req.body.session_id }, (err, doc) => {
    if (doc) {
      res.send([true, doc.role]);
    } else {
      res.send(false);
    }
  });
});
app.get("/users", async (req, res) => {
  let users = await userSchema.find({}).select("username email role team admin -_id");
  res.send(users);
});

app.post("/clearSession", (req, res) => {
  SessionScheme.findOneAndDelete(
    { session_id: req.body.session_id },
    (err, session) => {
      err ? res.send(false) : res.send(true);
    }
  );
});

app.get("/userName/:session_id", (req, res) => {
  sessionSchema.findOne({ session_id: req.params.session_id }, (err, doc) => {
    if (!err) res.send(doc.username);
    else res.send(null);
  });
});
