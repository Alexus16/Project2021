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

//Roles
groupRoles = []; //группы, 2-мерный массив, 1 индекс - название предмета, второй - номер группы
moderatorRole = null; //Модер
testerRole = null; //Тестер
HWRole = null; //Заполнение дз

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
                }

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
                        message.channel.send('Роль модератора установлена.\nНастройка завершена, выполняю сохранение...\nВведите через хештег канал управления ботом...');
                        stageSetup = 3;
                        fs.writeFileSync(generalRolesPath, testerRole.id + sep1 + HWRole.id + sep1 + moderatorRole.id, 'utf8');
                        console.log('Администратор обновил основные роли...')
                    }
                break;
                case 3:
                    
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
                            stageSetup = 4;
                        }
                    
                break;
                case 4:
                    
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
                            stageSetup = 5;
                        }
                    
                break;
                case 5:

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
                            message.channel.send('Канал установлен, настройка завершена.\nВыполняю сохранение...');
                            stageSetup = 0;
                            isSetup = false;
                            fs.writeFileSync(generalChannelsPath, botChannel+sep1+logChannel+sep1+infoChannel, 'utf8')
                            console.log('Администратор обновил основные каналы...');
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
                message.channel.send('Введите через тег роль тестера...')
            }
    }
});
if(fs.existsSync('../token.txt'))
{
    token = fs.readFileSync('../token.txt').toString();
    console.log(token);
    bot.login(token).catch(() => console.error("token rejected"));
}