const express = require("express")
const app = express()
const mysql = require('mysql');
const fs = require("fs")
const bodyParser = require('body-parser')
const { execFile } = require("child_process")
const path = require("path")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const { spawn } = require('child_process');
const { log } = require("console");


const secretKey="hjuikoijuihjgolp;hgfhop;gf"

const connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'Payal05$',
    database : 'onlinejudge',
    insecureAuth: true,
    authPlugins: {
        mysql_native_password: false
      }
  });
  
  connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});
module.exports = connection;
// connection.connect();

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// for post requests
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// use cookie parser 
app.use(cookieParser())

// app.get("/login", (req, res)=>{
//     res.render("login.ejs")
// })

// const loggedInNext = async (req, res, next) => {
//     try {
//         const cookie = req.cookies.user
//         const verify = jwt.verify(cookie, secretKey)

//      verify.user === "priyanshu1915341@gndec.ac.in" || verify.user === "payal1915338@gndec.ac.in" || verify.user === "devansh1915307@gndec.ac.in" ? next() : res.redirect("/login")
//     } catch (e) {
//         res.redirect("/login")
//     }
// }

// const loggedInRedirect = async (req, res, next) => {
//     try {
//         const cookie = req.cookies.user
//         const verify = jwt.verify(cookie, secretKey)

//       verify.user === "priyanshu1915341@gndec.ac.in" || verify.user === "payal1915338@gndec.ac.in" || verify.user === "devansh1915307@gndec.ac.in" ? res.redirect("/") : next()
//     } catch (e) {
//         next()
//     }
// }

const loggedInNext = async (req, res, next) => {
    try {
        const cookie = req.cookies.user
        const verify = jwt.verify(cookie, secretKey)
        if (!verify.user) {
          return res.redirect("/login")
        }
        req.user = verify.user
        next()
    } catch (e) {
        res.redirect("/login")
    }
}

const loggedInRedirect = async (req, res, next) => {
    try {
        const cookie = req.cookies.user
        const verify = jwt.verify(cookie, secretKey)
        if (verify.user) {
          return res.redirect("/")
        }
        next()
    } catch (e) {
        next()
    }
}

app.get("/login",loggedInRedirect,(req, res)=>{
    res.render("login.ejs")
})
app.get("/", loggedInNext, (req, res)=>{
    res.render("home.ejs")
})
app.get("/home.html", loggedInNext, (req, res)=>{
    res.render("home.ejs")
})
app.get("/contests.html", loggedInNext, (req, res)=>{
    res.render("contests.ejs")
})
app.get("/QuesFact.html", loggedInNext, (req, res)=>{
    res.render("QuesFact.ejs")
})
app.get("/QuesPalindrome.html", loggedInNext, (req, res)=>{
    res.render("QuesPalindrome.ejs")
})
app.get("/QuesSmallerGreater.html", loggedInNext, (req, res)=>{
    res.render("QuesSmallerGreater.ejs")
})
app.get("/QuesEquilibriumIndex.html", loggedInNext, (req, res)=>{
    res.render("QuesEquilibriumIndex.ejs")
})
app.get("/QuesLongestSubstring.html", loggedInNext, (req, res)=>{
    res.render("QuesLongestSubstring.ejs")
})
app.get("/QuesMaxProduct.html", loggedInNext, (req, res)=>{
    res.render("QuesMaxProduct.ejs")
})
app.get("/index.html", loggedInNext, (req, res)=>{
    res.render("index.ejs")
})

// app.post("/login", async (req, res) => {
//     try {
//       if ((req.body.user === "priyanshu1915341@gndec.ac.in" && req.body.password === "1234") || (req.body.user === "payal1915338@gndec.ac.in" && req.body.password === "0000") || (req.body.user === "devansh1915307@gndec.ac.in" && req.body.password === "0000")) {
//             const cookie = jwt.sign({ user: req.body.user }, secretKey)
//             res.cookie("user", cookie, {
//                 expires: new Date(Date.now() + (6 * 60 * 60 * 1000)), //expires after 6 hours
//                 httpOnly: true
//             }).redirect("/")
//         } else {
//             res.send(`<script>
//             const c = confirm("Wrong Details")

//             c == true ? window.location.href="/login" : window.location.href="/login"
//             </script>`)
//         }
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

app.post("/login", async (req, res) => {
    try {
      const email = req.body.user;
      const password = req.body.password;
  
      if (!email|| !password) {
        return res.status(400).send("Email and password are required");
      }
  
      connection.query("select * from demousers;", (error, results) => {
        if (error) {
          console.error(error);
        } else {
          console.log(results);
        }
      });
  
      const query = `SELECT email, password FROM demousers WHERE email = ? and password = ?;`;
      connection.query(query, [email, password], (err, result) => {
        if (err) {
          console.log(err);
          console.log(result && result.length);
          return res.status(500).send("Internal Server Error");
        }
        if (result.length && (email === result[0].email) && password === result[0].password ) {
          const cookie = jwt.sign({ user: req.body.user }, secretKey);
          return res
            .cookie("user", cookie, {
              expires: new Date(Date.now() + 6 * 60 * 60 * 1000), //expires after 6 hours
              httpOnly: true,
            })
            .redirect("/");
        }
        if (result.length === 0) {
          console.log(email);
          console.log(result);
          return res.status(401).send("Invalid email or password");
        }
        const user = { email: result[0].email, id: result[0].id };
        const token = jwt.sign({ user }, secretKey);
        return res
          .cookie("user", token, {
            expires: new Date(Date.now() + 6 * 60 * 60 * 1000), //expires after 6 hours
            httpOnly: true,
          })
          .redirect("/");
      });
    } catch (error) {
      return res.status(400).send(error);
    }
  });
  

app.post("/compiler", loggedInNext, async (req, res) => {
    try {
        const { language, code, customInput, submit, quesId, contestId } = req.body
        console.log("this-> " + quesId);
        const rand = Math.floor(Math.random() * 100)
        const extensions = {
            c: "c",
            cpp: "cpp",
            python: "py",
            java:"java"
        }

        const filename = path.join(__dirname, "/uploads/") + rand + "." + extensions[language]
        await fs.promises.writeFile(filename, code);

        // create custom input file if custom input is there 
        // let inputFile = "./server/uploads/execFiles/inputHunBhai.txt"
        if (customInput && !submit) {
            await fs.promises.writeFile(__dirname + "/uploads/execFiles/customInput.txt", customInput);
            // inputFile = "./server/uploads/execFiles/customInput.txt"
        }

        // if (language === "python") {
        //     // execFile("python3", ["cat","/Users/anorangefalcon/Desktop/OJ G50/server/uploads/execFiles/inputHunBhai.txt", "|", "python3", filename], (err, stdout, stderr) => {
        //     execFile("cat", [path.join(__dirname, "/uploads/inputHunBhai.txt"), "|", "python3", filename], { "shell": true }, (err, stdout, stderr) => {
        //         if (stderr) {
        //             console.log(stderr);
        //             console.log(err);
        //             return res.json({ error: stderr })
        //         }
        //         console.log(stdout);
        //         res.json({ output: stdout })
        //     })
        // }



        // let inputFiles = ["input1.txt", "input2.txt", "input3.txt"]
        // let outputFiles = ["output1.txt", "output2.txt", "output3.txt"]
        let inputFiles;
        let outputFiles;
        
        try {
            inputFiles = await fs.promises.readdir(`./server/problems/${quesId}/inputs/`);
            outputFiles = await fs.promises.readdir(`./server/problems/${quesId}/outputs/`);
        } catch (error) {
            console.error('Error reading directory:', error);
            return;
        }

          var score;

        if (language === "cpp") {
            const outfile = `./server/uploads/execFiles/${rand}.out`

            execFile("g++", [filename, "-o", outfile], (err, stdout, stderr) => {
                console.log("stdout: " + stdout);
                if (stderr) {
                    console.log("stderr:" +stderr);
                    return res.json({ error: stderr })
                } else {
                    // return execFile(`./${outfile}`, (err, output, stderr) => {
                    let outputsSuccess = 0;
                    if (submit) {
                        return inputFiles.map((fileName, key) => {
                            console.log("hehe" + `./server/problems/${quesId}/inputs/` + fileName)
                            execFile(`./${outfile}`, ["<", `./server/problems/${quesId}/inputs/` + fileName], { shell: true }, async (err, output, stderr) => {
                                console.log("stderr:" +stderr);
                                if (err) {
                                    console.log(err);
                                } else {
                                    // console.log(output);
                                    const read = await fs.promises.readFile(`./server/problems/${quesId}/outputs/${outputFiles[key]}`, "utf-8")
                                    console.log(output, read);

                                    // const success=outputsSuccess || 0
                                    // output === read ? outputsSuccess=success+1: outputsSuccess=
                                    outputsSuccess = (output === read) ? outputsSuccess + 1 : outputsSuccess
                                    // outputs.push(output)
                                    console.log(key, inputFiles.length - 1);

                                    return (key === inputFiles.length - 1) ? 
                                    setTimeout(()=>{
                                        res.json({ output: `${outputsSuccess}/${inputFiles.length} tests passed.` })
                                    }, 10) : ""
                                }
                            })
                        })
                        // return outputsSuccess? res.json({ output:`${outputsSuccess}/3 tests passed.` }):""
                    }
                    return execFile(`./${outfile}`, ["<", "./server/uploads/execFiles/customInput.txt"], { shell: true }, (err, output, stderr) => {
                        console.log(stderr);
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(output);
                            res.json({ output })
                        }
                    })
                }
            })
        }

        if (language === "c") {
            const outfile = `./server/uploads/execFiles/${rand}.out`
            execFile("gcc", [filename, "-o", outfile], (err, stdout, stderr) => {
                console.log("stdout: " + stdout);
                if (stderr) {
                    console.log("stderr:" +stderr);
                    return res.json({ error: stderr })
                } else {
                    // return execFile(`./${outfile}`, (err, output, stderr) => {
                    let outputsSuccess = 0;
                    if (submit) {
                        return inputFiles.map((fileName, key) => {
                            console.log("hehe" + `./server/problems/${quesId}/inputs/` + fileName)
                            execFile(`./${outfile}`, ["<", `./server/problems/${quesId}/inputs/` + fileName], { shell: true }, async (err, output, stderr) => {
                                console.log("stderr:" +stderr);
                                if (err) {
                                    console.log(err);
                                } else {
                                    // console.log(output);
                                    const read = await fs.promises.readFile(`./server/problems/${quesId}/outputs/${outputFiles[key]}`, "utf-8")
                                    console.log(output, read);

                                    // const success=outputsSuccess || 0
                                    // output === read ? outputsSuccess=success+1: outputsSuccess=
                                    outputsSuccess = (output === read) ? outputsSuccess + 1 : outputsSuccess
                                    // outputs.push(output)
                                    console.log(key, inputFiles.length - 1);

                                    return (key === inputFiles.length - 1) ? 
                                    setTimeout(()=>{
                                        res.json({ output: `${outputsSuccess}/${inputFiles.length} tests passed.` })
                                    }, 10) : ""
                                }
                            })
                        })
                        // return outputsSuccess? res.json({ output:`${outputsSuccess}/3 tests passed.` }):""
                    }
                    return execFile(`./${outfile}`, ["<", "./server/uploads/execFiles/customInput.txt"], { shell: true }, (err, output, stderr) => {
                        console.log(stderr);
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(output);
                            res.json({ output })
                        }
                    })
                }
            })
        }

        if (language === "python") {
            const pyfile = filename;

            if (submit) {
                return inputFiles.map((fileName, key) => {
                    const python = spawn('python3', [pyfile]);
                    const inputFile = fs.createReadStream(`./server/problems/${quesId}/inputs/` + fileName);
                    console.log(inputFile);
                    inputFile.pipe(python.stdin);

                    let output = '';
                    python.stdout.on('data', (data) => {
                        output += data.toString();
                    });

                    python.stdout.on('end', async () => {
                        const read = await fs.promises.readFile(`./server/problems/${quesId}/outputs/${outputFiles[key]}`, "utf-8");
                        console.log(output, read);
                        outputsSuccess = (output.trim() === read.trim()) ? outputsSuccess + 1 : outputsSuccess;

                        if (key === inputFiles.length - 1) {
                            setTimeout(()=>{
                                res.json({ output: `${outputsSuccess}/${inputFiles.length} tests passed.` });
                                // res.json({ output: `${outputsSuccess}/3 tests passed.` });
                            }, 10);
                        }
                    });
                });
            } else {
                const python = spawn('python3', [pyfile]);
                const customInputFile = fs.createReadStream("./server/uploads/execFiles/customInput.txt");

                customInputFile.pipe(python.stdin);

                let output = '';
                python.stdout.on('data', (data) => {
                    output += data.toString();
                });

                python.stdout.on('end', () => {
                    console.log(output);
                    res.json({ output });
                });
            }
        }

        // if (language === "python") {
        //     const pyfile = filename;
            
        //     if (submit) {
        //         return inputFiles.map((fileName, key) => {
        //             execFile("cat", [path.join(__dirname, `./server/problems/${quesId}/inputs/` + fileName), "|", "python3", pyfile], { shell: true }, async (err, output, stderr) => {
        //                 if (stderr) {
        //                     console.log(stderr);
        //                     return res.json({ error: stderr });
        //                 }
        //                 else {
        //                     const read = await fs.promises.readFile(`./server/problems/${quesId}/outputs/${outputFiles[key]}`, "utf-8");
        //                     console.log(output, read);
        //                     outputsSuccess = (output === read) ? outputsSuccess + 1 : outputsSuccess;
        
        //                     return (key === inputFiles.length - 1) ? 
        //                     setTimeout(()=>{
        //                         res.json({ output: `${outputsSuccess}/${inputFiles.length} tests passed.` })
        //                     }, 10) : ""
        //                 }
        //             })
        //         })
        //     }
        
        //     execFile("cat", [path.join(__dirname, "./server/uploads/execFiles/customInput.txt"), "|", "python3", pyfile], { shell: true }, (err, output, stderr) => {
        //         if (stderr) {
        //             console.log(stderr);
        //             return res.json({ error: stderr });
        //         }
        //         else {
        //             console.log(output);
        //             res.json({ output });
        //         }
        //     })
        // }
        log(req.user)

        const queryUpdateScore=`update q_${quesId} from c_${contestId} where user=${req.user} score=${score}`
        // connection.query(queryUpdateScore, [email, password], (err, result) => {
        //     if (err) {
        //       console.log(err);
        //       console.log(result && result.length);
        //       return res.status(500).send("Internal Server Error");
        //     }
        //     if (result.length && (email === result[0].email) && password === result[0].password ) {
        //       const cookie = jwt.sign({ user: req.body.user }, secretKey);
        //       return res
        //         .cookie("user", cookie, {
        //           expires: new Date(Date.now() + 6 * 60 * 60 * 1000), //expires after 6 hours
        //           httpOnly: true,
        //         })
        //         .redirect("/");
        //     }
        //     if (result.length === 0) {
        //       console.log(email);
        //       console.log(result);
        //       return res.status(401).send("Invalid email or password");
        //     }
        //     const user = { email: result[0].email, id: result[0].id };
        //     const token = jwt.sign({ user }, secretKey);
        //     return res
        //       .cookie("user", token, {
        //         expires: new Date(Date.now() + 6 * 60 * 60 * 1000), //expires after 6 hours
        //         httpOnly: true,
        //       })
        //       .redirect("/");
        //   });
        

    } catch (error) {
        console.log(error);
    }
})

// app.get("/result", async(req, res)=>{

// })

// app.post("/submit-ques", async (req, res) => {
//     try {
//         const { language, code, customInput, quesId } = req.body
//         console.log(customInput);
//         const rand = Math.floor(Math.random() * 100)
//         const extensions = {
//             c: "c",
//             cpp: "cpp",
//             python: "py"
//         }

//         const filename = path.join(__dirname, "/uploads/") + rand + "." + extensions[language]
//         await fs.promises.writeFile(filename, code);

//         // create custom input file if custom input is there 
//         // let inputFile = "./server/uploads/execFiles/inputHunBhai.txt"
//         if (customInput) {
//             await fs.promises.writeFile(__dirname + "/uploads/execFiles/customInput.txt", customInput);
//             inputFile = "./server/uploads/execFiles/customInput.txt"
//             await fs.promises.writeFile(__dirname + "/uploads/execFiles/inputHunBhai.txt", customInput);
//         }

//         // if (language === "python") {
//         //     // execFile("python3", ["cat","/Users/anorangefalcon/Desktop/OJ G50/server/uploads/execFiles/inputHunBhai.txt", "|", "python3", filename], (err, stdout, stderr) => {
//         //     execFile("cat", [path.join(__dirname, "/uploads/inputHunBhai.txt"), "|", "python3", filename], { "shell": true }, (err, stdout, stderr) => {
//         //         if (stderr) {
//         //             console.log(stderr);
//         //             console.log(err);
//         //             return res.json({ error: stderr })
//         //         }
//         //         console.log(stdout);
//         //         res.json({ output: stdout })
//         //     })
//         // }
        
//         if (language == "python") {
//             const { spawn } = require('child_process');
//             const cat = spawn("cat", [path.join(__dirname, "/uploads/inputHunBhai.txt")]);
//             const python = spawn("python3", [filename]);
        
//             cat.stdout.pipe(python.stdin);
        
//             python.stdout.on("data", (data) => {
//                 console.log(data.toString());
//                 res.json({ output: data.toString() });
//             });
        
//             python.stderr.on("data", (data) => {
//                 console.log(data.toString());
//                 res.json({ error: data.toString() });
//             });
        
//             python.on("error", (err) => {
//                 console.log(err);
//                 res.json({ error: "Failed to execute Python script" });
//             });
//         }
        
//         if (language === "cpp") {
//             const outfile = `./server/uploads/execFiles/${rand}.out`

//             execFile("g++", [filename, "-o", outfile], (err, stdout, stderr) => {
//                 console.log(stdout);
//                 if (stderr) {
//                     console.log(stderr);
//                     return res.json({ error: stderr })
//                 } else {
//                     // return execFile(`./${outfile}`, (err, output, stderr) => {
//                     return execFile(`./${outfile}`, ["<", inputFile], { shell: true }, (err, output, stderr) => {
//                         console.log(stderr);
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             console.log(output);
//                             res.json({ output })
//                         }
//                     })
//                 }
//             })
//         }
//         if (language === "c") {
//             const outfile = `./server/uploads/execFiles/${rand}.out`

//             execFile("gcc", [filename, "-o", outfile], (err, stdout, stderr) => {
//                 console.log(stdout);
//                 if (stderr) {
//                     console.log(stderr);
//                     return res.json({ error: stderr })
//                 } else {
//                     return execFile(`./${outfile}`, ["<", inputFile], { shell: true }, (err, output, stderr) => {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             console.log(output);
//                             res.json({ output })
//                         }
//                     })
//                 }
//             })
//         }
//     } catch (error) {
//         console.log(error);
//     }
// })

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server on port- ${port}`);
})