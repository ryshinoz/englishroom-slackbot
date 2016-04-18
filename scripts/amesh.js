var ameeeeesh, fs, get_gif_name, get_tmp_image, gm, gmbase, loop_with, mktemp, path, request, temppath, url;

fs = require('fs');
path = require('path');
gmbase = require('gm');

gm = gmbase.subClass({
  imageMagick: true
});

mktemp = require('mktemp');

request = require('request');

temppath = path.join(process.env.PWD, '..', 'tmp');

url = process.env.HEROKU_URL;

if (!url) {
  url = 'http://localhost:8080';
}

ameeeeesh = function(gif_name, cb) {
  var error;
  try {
    fs.statSync(temppath);
  } catch (_error) {
    error = _error;
    console.log(error);
    fs.mkdirSync(temppath, '0700');
  }
  return get_tmp_image('http://tokyo-ame.jwa.or.jp/mesh/000/' + gif_name + '.gif', 'gif', function(mesh_image) {
    return get_tmp_image('http://tokyo-ame.jwa.or.jp/map/msk000.png', 'png', function(map_image) {
      var base_mesh_image;
      base_mesh_image = path.join(temppath, 'amesh_base' + gif_name + '.png');
      return get_tmp_image('http://tokyo-ame.jwa.or.jp/map/map000.jpg', 'jpg', function(base_image) {
        var result_image;
        result_image = path.join(temppath, 'amesh_' + gif_name + '.png');
        return gm().command("composite")["in"]("-gravity", "center")["in"](map_image)["in"](mesh_image).write(base_mesh_image, function(err) {
          if (err) {
            console.log(err);
          }
          return gm().command("composite")["in"]("-gravity", "center")["in"](base_mesh_image)["in"](base_image).write(result_image, function(err) {
            var result_image_with_time;
            if (err) {
              console.log(err);
            }
            result_image_with_time = path.join(temppath, 'amesh_time_' + gif_name + '.png');
            return gm(result_image).command("convert").font("Arial").fontSize(24).drawText(460, 475, gif_name).write(result_image_with_time, function(err) {
              return cb(result_image_with_time);
            });
          });
        });
      });
    });
  });
};

get_tmp_image = function(image_url, ftype, cb) {
  var filename;
  filename = mktemp.createFileSync(path.join(temppath, 'XXXXXXXXXX.' + ftype));
  return request.get(image_url).on('end', function(res) {
    return cb(filename);
  }).pipe(fs.createWriteStream(filename));
};

get_gif_name = function(d) {
  var day, hour, min, month, year;
  year = d.getFullYear();
  month = ('0' + (d.getMonth() + 1)).slice(-2);
  day = ('0' + d.getDate()).slice(-2);
  hour = ('0' + d.getHours()).slice(-2);
  min = ('0' + Math.floor(d.getMinutes() / 5) * 5).slice(-2);
  return '' + year + month + day + hour + min;
};

loop_with = function(count, block, final) {
  if (count > 0) {
    return block(function() {
      return loop_with(count - 1, block, final);
    });
  } else {
    return final();
  }
};

controller.hears(['amesh ?([0-9]+)?'],'direct_message,direct_mention,mention',function(bot, message) {
  var anime, d, last_image, time;
  controller.storage.users.get(message.user,function(err, user) {
    bot.reply(message, 'verified');
  });
  var matches = message.text.match(/^amesh ?([0-9]+)?$/);
  time = Number(matches[1]) || 30;
  console.log('time: ' + time);
  request = require('request');
  d = new Date();
  anime = gm().command("convert")["in"]("-delay", "20")["in"]("-loop", "0")["in"]("-dispose", "background")["in"]("-coalesce")["in"]("-deconstruct")["in"]("-colors", "50")["in"]("-crop", "500x350+120+130!");
  d.setMinutes(d.getMinutes() - (time + 1));
  last_image = "";
  return loop_with(Math.floor(time / 5), (function(cb) {
    d.setMinutes(d.getMinutes() + 5);
    return ameeeeesh(get_gif_name(d), function(image) {
      console.log(image);
      anime["in"](image);
      last_image = image;
      return cb();
    });
  }), (function() {
    var anime_image;
    anime["in"](last_image);
    anime["in"](last_image);
    anime["in"](last_image);
    anime["in"](last_image);
    anime["in"](last_image);
    anime_image = path.join(temppath, 'amesh_anime_' + get_gif_name(d) + '.gif');
    return anime.write(anime_image, function(err) {
      var image;
      if (err) {
        console.log(err);
      }
      image = url + "/hubot/temp.png?id=" + path.basename(anime_image);
      controller.storage.users.get(message.user,function(err, user) {
        return bot.reply(message,image);
      });
    });
  }));
});

