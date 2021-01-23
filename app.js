//搭建express服务
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../', 'public')));
 
server.listen(PORT, () => console.log(`监听到端口${PORT}`));

var uu=[]//用户列表
var liaotian=[]//聊天记录
var users = {}//用于保存每一次有用户登录，就保存用户信息
const USER_STATUS = ['ONLINE', 'OFFLINE'];//判断用户是否在线['在线','离线']
//创建socket对象
const io = require('socket.io')(server);
io.on("connection",socket=> {
  console.log("新用户加入连接")
  //用户登录成功时加入并保存用户id
  socket.on("online",username=>{
    socket.username = username.user_name;
    socket.userphoto = username.user_photo;
    users[username.user_name] = {
      user_names:socket.username,
      user_photo:socket.userphoto,
      socketId: socket.id,//每一次用户新加入都会发生改变
      status: USER_STATUS[0]
    };
    io.emit("ces","hhhhh")
    // console.log(users[username.user_name])
  })

  //添加到聊天列表
  socket.on("userchatlist",data=>{
    const receiver = users[data.user_name];
    //判断是不是当前用户操作
    // console.log(receiver)
    // console.log(data)
    if (receiver && receiver.status === USER_STATUS[0]) {
    //   const find = uu.find(item=>{
    //     return item.uid===data.uid
    //   })
    //   if(find){
    //     socket.emit("sendError",{msg:"该用户已存在您的聊天列表"})
    //     console.log("该用户已存在")
    //   }else{
        // uu.push(data)
        //发送人
        socket.emit("senderEmit",data)
        console.log("1111")
    //   }
    //   // 接收人
      // io.to(users[data.user_name].socketId).emit('senduserlist',"发送人信息")
    } else {
      console.log(`${data.user_name} 不在线`);
      // 可以在做些离线消息推送处理
    }
  })

  //接收聊天记录
  socket.on("chatMsgEmit",data=>{
    console.log("data的数据",data)
    const receiver = users[data.user_name];
    // console.log(data)
    //判断是不是同个用户发的，就不用再往数组里面添加，只需在聊天记录信息数组添加 
    // if(liaotian.length>0){
    //   for(let i=0;i<liaotian.length;i++)
    //   {
    //     const nn = liaotian.map(item=>{
    //       return item.sender.user_name//["李四"]
    //     })
    //       const xb = nn.indexOf(data.sender.user_name)//0
    //       // console.log(xb)
    //       //返回-1说明没有相同的id,判断是不是同一个用户，
    //       if(xb!=-1){
    //         //如果是同个用户发消息，再判断是不是发给同一个人,找到同个用户发的消息
    //           if(liaotian[xb].user_name==data.user_name)//张三==张三
    //           {
    //             liaotian[xb].messages.push(data.messages[0])
    //             break
    //           }
    //           else{
    //             liaotian.push(data)
    //             break
    //           }
    //       }else{
    //         liaotian.push(data)
    //         liaotian = []//清除上一个用户的消息
    //         break
    //       }
    //   }
    //   if (receiver && receiver.status === USER_STATUS[0])
    //   {
       
    //     console.log("长度大于0",liaotian)
    //     socket.emit("chatMsgOn",liaotian)
    //     //只要发过去的消息
    //     io.to(users[data.user_name].socketId).emit("sendMsgOn",liaotian)
    //     liaotian = []//清除同个用户发的上一条记录
    //   }
    // }else{
    //   if (receiver && receiver.status === USER_STATUS[0])
    //   {
        console.log(receiver)
        liaotian.push(data)
        io.to(users[data.user_name].socketId).emit("sendMsgOn",liaotian)
        socket.emit("chatMsgOn",liaotian)
        console.log("第一次执行",liaotian)
        liaotian = []
      // }
  //   }
  })

  //用户退出登录
  socket.on('disconnect', reason => {
    // socket.on("signOut",data=>{
      if (users[socket.username]){
        users[socket.username].status = USER_STATUS[1];
      }
    // })
      
  });
  
})