const Discord = require('discord.js');
const bot = new Discord.Client();
const { info, Console } = require('console');
const fs = require('fs');
const { sep } = require('path');
const { builtinModules } = require('module');

//General vars
server = null;
infoChannel = null;
logChannel = null;
botChannel = null;
prefix = ',';

sep1 = '|';
sep2 = ';';


//System Roles
warnRoles = [null, null];
warnRolesPath = 'warnRoles.txt';

//Roles
groupRoles = []; //группы, 2-мерный массив, 1 индекс - название предмета, второй - номер группы
moderatorRole = null; //Модер
testerRole = null; //Тестер
HWRole = null; //Заполнение дз
adminRole = null; //Админимтратор
developerRole = null; //Разработчик

//Categories
groupCategories = [];

//Pathes
serverPath = 'server.txt';
generalChannelsPath = 'channels.txt';
groupChannelsPath = 'groupChannel.txt';
generalRolesPath = 'roles.txt';
groupRolesPath = 'groupRoles.txt';
bot.on('ready', () =>
{
    //Подключение сохранённого сервера
    if(!fs.existsSync(serverPath))
    {
        console.log("Файл с сохранённым сервером не обнаружен, ожидание команды !connect для подключения сервера...");
    }
    else
    {
        console.log("Файл с сохранённым сервером обнаружен. Попытка подключения...");
        _serverId = fs.readFileSync(serverPath);
        server = bot.guilds.cache.find(guild => guild.id == _serverId);
        if(server != null)
        {
            console.log('Сервер подключён.')
            if(fs.existsSync(generalRolesPath))
            {
                const _temp = fs.readFileSync(generalRolesPath).toString();
                _ids = _temp.split(sep1);
                testerRole = server.roles.cache.find(role => role.id == _ids[0]);
                if(testerRole == null)
                {
                    console.log('Роль тестера не найдена...');
                }
                else
                {
                    console.log('Роль тестера установлена');
                }
                HWRole = server.roles.cache.find(role => role.id == _ids[1]);
                if(HWRole == null)
                {
                    console.log('Роль заполнителя ДЗ не найдена...');
                }
                else
                {
                    console.log('Роль заполнителя ДЗ установлена');
                }
                moderatorRole = server.roles.cache.find(role => role.id == _ids[2]);
                if(moderatorRole == null)
                {
                    console.log('Роль модератора не найдена...');
                }
                else
                {
                    console.log('Роль модератора установлена');
                }
                adminRole = server.roles.cache.find(role => role.id == _ids[3]);
                if(adminRole == null)
                {
                    console.log('Роль администратора не найдена...');
                }
                else
                {
                    console.log('Роль администратора установлена');
                }
                developerRole = server.roles.cache.find(role => role.id == _ids[4]);
                if(developerRole == null)
                {
                    console.log('Роль разработчика не найдена...');
                }
                else
                {
                    console.log('Роль разработчика установлена');
                }
            }
            if(fs.existsSync(generalChannelsPath))
            {
                const _temp = fs.readFileSync(generalChannelsPath).toString();
                _ids = _temp.split(sep1);
                botChannel = server.channels.cache.find(channel => channel.id == _ids[0]);
                if(botChannel == null)
                {
                    console.log('Канал управления ботом не найден...');
                }
                else
                {
                    console.log('Канал управления ботом установлен');
                }
                logChannel = server.channels.cache.find(channel => channel.id == _ids[1]);
                if(logChannel == null)
                {
                    console.log('Канал логирования не найден...');
                }
                else
                {
                    console.log('Канал логирования установлен');
                }
                infoChannel = server.channels.cache.find(channel => channel.id == _ids[2]);
                if(infoChannel == null)
                {
                    console.log('Канал информации не найден...');
                }
                else
                {
                    console.log('Канал информации установлен');
                    infoChannel.send('```Бот запущен и готов к работе```');
                }

            }
            if(fs.existsSync(warnRolesPath))
            {
                _temp = fs.readFileSync(warnRolesPath).toString();
                _ids = _temp.split(sep1);
                warnRoles[0] = server.roles.cache.find(role => role.id == _ids[0]);
                if(warnRoles[0] == null)
                {
                    console.log('Роль warn1 не найдена...')
                    fs.rmSync(warnRolesPath);
                }
                else
                {
                    console.log('Роль warn1 установлена')
                }
                warnRoles[1] = server.roles.cache.find(role => role.id == _ids[1]);
                if(warnRoles[1] == null)
                {
                    console.log('Роль warn2 не найдена...')
                    fs.rmSync(warnRolesPath);
                }
                else
                {
                    console.log('Роль warn2 установлена')
                }
            }
            else
            {
                server.roles.create({data: {name: "Warn[1/3]"}}).then(newRole => warnRoles[0] = newRole);
                server.roles.create({data: {name: "Warn[2/3]"}}).then(newRole => warnRoles[1] = newRole).then(() => fs.writeFileSync(warnRolesPath, warnRoles[0].id + sep1 + warnRoles[1].id));
            }
        }
        else
        {
            console.log("Сохранённый сервер не может быть найден или пдключён. Ожидание команды !connect для подключения нового сервера...")
        }
    }
});

isSetup = false;
stageSetup = 0;
bot.on('message', message =>
{
    //console.log('Зарегистрировано сообщение от ' + message.author.username); //отладочное, будет удалено
    msg = message.content;
    
    if(message.author == bot.user)
    {
        return;
    }
    
    if(msg.startsWith(prefix + 'connect'))
    {
        botChannel = message.channel;
        server = message.guild;
        fs.writeFileSync(serverPath, server.id, 'utf8');
        return;
    }

    if(isSetup)
        {
            switch(stageSetup)
            {
                case 0:
                    testerRole = message.mentions.roles.first();
                    if(testerRole == null)
                    {
                        message.channel.send('Ошибка, отмена настройки...');
                        isSetup = false;
                        stageSetup = 0;
                        return;
                    }
                    else
                    {
                        message.channel.send('Роль тестера установлена.\nВведите через тег роль заполнителя ДЗ...');
                        stageSetup = 1;
                    }
                break;
                case 1:
                    HWRole = message.mentions.roles.first();
                    if(HWRole == null)
                    {
                        message.channel.send('Ошибка, отмена настройки...');
                        isSetup = false;
                        stageSetup = 0;
                        return;
                    }
                    else
                    {
                        message.channel.send('Роль заполнителя ДЗ установлена.\nВведите через тег роль модератора...');
                        stageSetup = 2;
                    }
                break;
                case 2:
                    moderatorRole = message.mentions.roles.first();
                    if(moderatorRole == null)
                    {
                        message.channel.send('Ошибка, отмена настройки...');
                        isSetup = false;
                        stageSetup = 0;
                        return;
                    }
                    else
                    {
                        message.channel.send('Роль модератора установлена.\nУкажите через тег роль администратора...');
                        stageSetup = 3;
                    }
                break;
                case 5:
                    
                        _tempChannel = botChannel;
                        botChannel = null;
                        botChannel = message.mentions.channels.first();
                        if(botChannel == null)
                        {
                            botChannel = _tempChannel;
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Канал установлен.\nВведите через хештег канал логирования бота...');
                            stageSetup = 6;
                        }
                    
                break;
                case 6:
                    
                        _tempChannel = logChannel;
                        logChannel = null;
                        logChannel = message.mentions.channels.first();
                        if(logChannel == null)
                        {
                            logChannel = _tempChannel;
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Канал установлен.\nВведите через хештег канал информации...');
                            stageSetup = 7;
                        }
                    
                break;
                case 7:

                        _tempChannel = infoChannel;
                        infoChannel = null;
                        infoChannel = message.mentions.channels.first();
                        if(botChannel == null)
                        {
                            infoChannel = _tempChannel;
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Канал установлен, настройка каналов завершена.\nВыполняю сохранение...\n');
                            stageSetup = 0;
                            isSetup = false;
                            fs.writeFileSync(generalChannelsPath, botChannel+sep1+logChannel+sep1+infoChannel, 'utf8')
                            console.log('Администратор обновил основные каналы...');
                        }  
                break;
                case 3:
                        adminRole = message.mentions.roles.first();
                        if(adminRole == null)
                        {
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Роль установлена. Укажите через тег роль разработчика...')
                            stageSetup = 4;
                        }
                break;
                case 4:
                        developerRole = message.mentions.roles.first();
                        if(developerRole == null)
                        {
                            message.channel.send('Ошибка, отмена настройки....');
                            isSetup = false;
                            stageSetup = 0;
                        }
                        else
                        {
                            message.channel.send('Роль установлена. Выполняю сохранение...\nУкажите через хештег канал управления ботом...')
                            stageSetup = 5;
                            fs.writeFileSync(generalRolesPath, testerRole.id + sep1 + HWRole.id + sep1 + moderatorRole.id + sep1 + adminRole.id + sep1 + developerRole.id, 'utf8');
                            console.log('Администратор обновил основные роли...');
                        }
                break;
                default:
                    message.channel.send("Что-то пошло не так:/");
            }
        }
    if(message.channel == botChannel)
    {
        //console.log('Зарегистрировано сообщение для бота от ' + message.author.username);
            if(msg.startsWith(prefix + 'setup'))
            {
                isSetup = true;
                stageSetup = 0;
                message.channel.send('Введите через тег роль тестера...');
            }
            else if(msg.startsWith(prefix + 'ban'))
            {
                userToBan = message.mentions.members.first();
                if(adminRole.members.find(_member => _member == server.members.cache.find(member => member.user == message.author)) != null
                && adminRole.members.find(_member => _member == userToBan) == null
                && moderatorRole.members.find(_member => _member == userToBan) == null
                && developerRole.members.find(_member => _member == userToBan) == null)
                {
                    console.log('WARN: Забанен пользователь ' + userToBan.user.username + ' администратором ' + message.author.username);
                    server.members.ban(userToBan, {days: 0, reason: 'Забанен администратором ' + message.author.username});
                    message.reply('Пользователь ' + userToBan.user.id + ' забанен');
                }
                else
                {
                    message.reply('Вы не являетесь администратором сервера или пользователь является модератором, администратором или разработчиком');
                }
            }
            else if(msg.startsWith(prefix + 'kick'))
            {
                userToKick = message.mentions.members.first();
                if(adminRole.members.find(_member => _member == server.members.cache.find(member => member.user == message.author)) != null
                && adminRole.members.find(_member => _member == userToKick) == null
                && moderatorRole.members.find(_member => _member == userToKick) == null
                && developerRole.members.find(_member => _member == userToKick) == null)
                {
                    console.log('INFO: Кикнут пользователь ' + userToKick.user.username + ' администратором ' + message.author.username);
                    userToKick.kick({reason: 'Кикнут администратором ' + message.author.username}).then(() => 
                    {
                        message.reply('Пользователь ' + userToKick.user.tag + ' кикнут');
                    });

                }
                else
                {
                    message.reply('Вы не являетесь администратором сервера или пользователь является модератором, администратором или разработчиком');
                }
            }
            else if(msg.startsWith(prefix + 'warn'))
            {
                userToWarn = message.mentions.members.first();
                if(adminRole.members.find(_member => _member.user == message.author) != null
                || moderatorRole.members.find(_member => _member.user == message.author) != null
                || developerRole.members.find(_member => _member.user == message.author) != null)
                {
                    if(warnRoles[0].members.find(_member => _member == userToWarn) != null)
                    {
                        userToWarn.roles.remove(warnRoles[0]);
                        userToWarn.roles.add(warnRoles[1], 'Выдано администратором' + message.author.username);
                        infoChannel.send('Пользователь <@' + userToWarn.user.id + '> получает [2/3] предупреждение');
                    }
                    else if(warnRoles[1].members.find(_member => _member == userToWarn) != null)
                    {
                        userToWarn.roles.remove(warnRoles[1]);
                        //warnRoles[1].members.concat(userToWarn);
                        infoChannel.send('Пользователь <@' + userToWarn.user.id + '> получает [3/3] предупреждение и будет кикнут с сервера');
                        userToWarn.kick('[3/3] предупреждений');
                    }
                    else
                    {
                        userToWarn.roles.add(warnRoles[0]);
                        infoChannel.send('Пользователь <@' + userToWarn.user.id + '> получает [1/3] предупреждение');
                    }
                }
                else
                {
                    message.reply('Вы не являетесь администратором, модератором или разработчиком');
                }
                
            }
            else if(!msg.startsWith(prefix))
            {
                message.delete();
            }
            
    }
});
if(fs.existsSync('../token.txt'))
{
    token = fs.readFileSync('../token.txt').toString();
    console.log(token);
    bot.login(token).catch(() => console.error("Error: token rejected, chack your bot token..."));
}
else
{
    console.error('Error: no token available...');
}