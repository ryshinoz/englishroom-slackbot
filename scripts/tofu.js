var tofu = 0x08;

controller.hears('.*', ['ambient'], function(bot, msg) {
  var buf = new Buffer(msg.text, 'UTF-8');

  if (buf.includes(tofu)) {
    var outputbuf = new Buffer('', 'UTF-8');
    var length = 0;
    var search_start_pos = 0;
    var pos = 0;

    while (buf.indexOf(tofu, search_start_pos) >= 0) {
      pos = buf.indexOf(tofu, search_start_pos);
      outputbuf = Buffer.concat([outputbuf, buf.slice(search_start_pos, pos)], outputbuf.length + pos - search_start_pos);
      search_start_pos = pos + 1;
    }

    outputbuf = Buffer.concat([outputbuf, buf.slice(search_start_pos, buf.length)], outputbuf.length + buf.length - search_start_pos);
    var output_str = outputbuf.toString('UTF-8');
    bot.reply(msg, "豆腐翻訳: " + output_str);
  }
});

