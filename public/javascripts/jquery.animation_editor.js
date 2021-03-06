/* DO NOT MODIFY. This file was compiled Wed, 08 Jun 2011 18:52:55 GMT from
 * /Users/matt/pixie.strd6.com/app/coffeescripts/jquery.animation_editor.coffee
 */

(function() {
  $.fn.animationEditor = function(options) {
    var active_animation, active_animation_sprites, animationCount, animationEditor, animation_id, clear_frame_sprites, clear_preview, createHitcircleEditor, createPixelEditor, editFrameCircles, frame_selected_sprite, frame_sprites, frame_sprites_container, loadData, pause_animation, pixelEditFrame, play_animation, play_next, preview_dirty, save, saveData, stop_animation, templates, update_active_animation;
    options = $.extend({
      speed: 110
    }, options);
    animationCount = 0;
    animationEditor = $(this.get(0)).addClass("animation_editor");
    templates = $("#animation_editor_templates");
    templates.find(".editor.template").tmpl().appendTo(animationEditor);
    animationEditor.find('input.speed').val(options.speed);
    animationEditor.mousedown(function() {
      return window.currentComponent = animationEditor;
    });
    animation_id = null;
    preview_dirty = false;
    clear_frame_sprites = function() {
      return frame_sprites().remove();
    };
    frame_sprites = function() {
      return frame_sprites_container().children();
    };
    frame_sprites_container = function() {
      return animationEditor.find('.frame_sprites');
    };
    frame_selected_sprite = function() {
      return animationEditor.find('.frame_sprites .sprite_container.selected');
    };
    active_animation = function() {
      return animationEditor.find('.animations .animation .active');
    };
    active_animation_sprites = function() {
      return active_animation().parent().find('.sprites');
    };
    clear_preview = function() {
      return animationEditor.find('.preview_box img').remove();
    };
    if ($.fn.hitcircleEditor) {
      createHitcircleEditor = function(options) {
        var hitcircleEditor;
        animationEditor = options.animationEditor;
        hitcircleEditor = $('<div />').hitcircleEditor({
          width: 640,
          height: 480,
          animationEditor: options.animationEditor,
          sprite: options.sprite,
          hitcircles: options.hitcircles
        });
        animationEditor.hide().after(hitcircleEditor);
        window.currentComponent = hitcircleEditor;
        return hitcircleEditor;
      };
    }
    if ($.fn.pixie) {
      createPixelEditor = function(options) {
        var pixelEditor, url;
        url = options.url;
        animationEditor = options.animationEditor;
        pixelEditor = $('<div />').pixie({
          width: options.width,
          height: options.height,
          initializer: function(canvas) {
            if (url) {
              canvas.fromDataURL(url);
            }
            canvas.addAction({
              name: "Save Frame",
              icon: "/images/icons/database_save.png",
              perform: function(canvas) {
                pixelEditor.trigger('save', {
                  'sprite[width]': canvas.width,
                  'sprite[height]': canvas.height,
                  'sprite[file_base64_encoded]': canvas.toBase64()
                });
                pixelEditor.remove();
                return animationEditor.show();
              },
              undoable: false
            });
            return canvas.addAction({
              name: "Back to Animation",
              icon: "/images/icons/arrow_left.png",
              perform: function(canvas) {
                pixelEditor.remove();
                return animationEditor.show();
              },
              undoable: false
            });
          }
        });
        animationEditor.hide().after(pixelEditor);
        window.currentComponent = pixelEditor;
        return pixelEditor;
      };
    }
    pixelEditFrame = function(selectedFrame) {
      var imgSource, pixelEditor;
      $(selectedFrame).parent().addClass('pixel_editor');
      if (createPixelEditor) {
        imgSource = selectedFrame.attr('src');
        pixelEditor = createPixelEditor({
          width: selectedFrame.get(0).width,
          height: selectedFrame.get(0).height,
          animationEditor: animationEditor,
          url: imgSource.replace('http://images.pixie.strd6.com', '/s3')
        });
        return pixelEditor.bind('save', save);
      }
    };
    editFrameCircles = function(sprite, hitcircles) {
      var hitcircleEditor, imgSource;
      if (createHitcircleEditor) {
        imgSource = sprite.find('img').attr('src');
        return hitcircleEditor = createHitcircleEditor({
          width: 640,
          height: 480,
          animationEditor: animationEditor,
          sprite: imgSource,
          hitcircles: hitcircles
        });
      }
    };
    save = function(event, data) {
      var postData, successCallback;
      notify("Saving...");
      successCallback = function(data) {
        var new_sprite;
        notify("Saved!");
        new_sprite = templates.find('.load_sprite').tmpl({
          alt: data.sprite.title || ("Sprite " + data.sprite.id),
          id: data.sprite.id,
          title: data.sprite.title || ("Sprite " + data.sprite.id),
          url: data.sprite.src
        });
        new_sprite.clone().appendTo(animationEditor.find('.user_sprites'));
        animationEditor.find(".frame_sprites .sprite_container.pixel_editor").before(new_sprite.clone()).remove();
        return animationEditor.find('.animations .animation .cover.active img').before(new_sprite.find('img')).remove();
      };
      if (data) {
        postData = $.extend({
          format: 'json'
        }, data);
        $.post('/sprites', postData, successCallback);
      }
      $('.pixie').remove();
      return animationEditor.show();
    };
    update_active_animation = function() {
      active_animation_sprites().parent().find('.sprites').children().remove();
      animationEditor.find('.frame_sprites .sprite_container').clone().appendTo(active_animation_sprites());
      active_animation().parent().find('.complete').text(animationEditor.find('.goto option:selected').val());
      return active_animation().parent().find('.speed').text(animationEditor.find('input.speed').val());
    };
    animationEditor.find(".frame_sprites").dropImageReader(function(file, event) {
      var img, sprite_container;
      if (event.target.readyState === FileReader.DONE) {
        sprite_container = $("<div class='sprite_container'></div>");
        img = $("<img/>", {
          alt: file.name,
          src: event.target.result,
          title: file.name
        });
        img.attr('data-hit_circles', JSON.stringify({
          circles: []
        }));
        sprite_container.append(img);
        animationEditor.find('.frame_sprites .demo, .frame_sprites p').remove();
        return $(this).append(sprite_container);
      }
    });
    animationEditor.find('.animations .name').liveEdit();
    animationEditor.find('.animation').live({
      mousedown: function(e) {
        if ($(e.target).is('.x')) {
          return;
        }
        update_active_animation();
        animationEditor.find('.speed').val($(this).find('.speed').text());
        animationEditor.find('.goto select').val($(this).find('.complete').text());
        stop_animation();
        clear_frame_sprites();
        $(this).find('.sprite_container').each(function(i, sprite_container) {
          var _ref, _ref2;
          $(sprite_container).find('.tags').removeClass('tag_container').children().remove();
          $(sprite_container).clone().appendTo(frame_sprites_container());
          if (((_ref = $(sprite_container).find('img')) != null ? _ref.attr('data-hflip') : void 0) === 'true') {
            $(".frame_sprites .sprite_container").eq(i).find('img').addClass('flipped_horizontal');
          }
          if (((_ref2 = $(sprite_container).find('img')) != null ? _ref2.attr('data-vflip') : void 0) === 'true') {
            return $(".frame_sprites .sprite_container").eq(i).find('img').addClass('flipped_vertical');
          }
        });
        if (!($(this).find('.sprites') && $(this).find('.sprites').children().length)) {
          templates.find('.placeholder').tmpl().appendTo('.frame_sprites');
        }
        active_animation().removeClass('active');
        $(this).find('.cover').addClass('active');
        if ($(this).find('.cover').hasClass('locked')) {
          return animationEditor.find('.lock').css('opacity', 1);
        } else {
          return animationEditor.find('.lock').css('opacity', 0.5);
        }
      },
      mouseenter: function() {
        if (animationEditor.find('.animations .animation').length > 1) {
          return $(this).find('.cover').append('<div class="x" title="close" alt="close" />');
        }
      },
      mouseleave: function() {
        return $(this).find('.x').remove();
      }
    });
    animationEditor.find('.animation .x').live({
      mousedown: function() {
        var animation, index;
        animation = $(this).parent().parent();
        index = animationEditor.find('.animations .animation').index(animation);
        animationEditor.find(".goto option").eq(index).remove();
        animation.prev().fadeOut(150, function() {
          return animation.prev().remove();
        });
        return animation.fadeOut(150, function() {
          return animation.remove();
        });
      }
    });
    animationEditor.find('.lock').tipsy({
      delayIn: 500,
      delayOut: 500,
      fade: 50,
      gravity: 'sw'
    }).live({
      mousedown: function() {
        var $this, animation;
        $this = $(this);
        animation = active_animation();
        animation.toggleClass('locked');
        if (animation.hasClass('locked')) {
          return $this.css('opacity', 1);
        } else {
          return $this.css('opacity', 0.5);
        }
      }
    });
    animationEditor.find('.new_animation').mousedown(function() {
      var animation, animation_name;
      update_active_animation();
      stop_animation();
      active_animation().removeClass('active');
      clear_frame_sprites();
      animation_name = "Animation " + ++animationCount;
      animation = templates.find('.create_animation').tmpl({
        name: animation_name,
        complete: animation_name
      });
      animation.insertBefore(animationEditor.find('.new_animation'));
      animationEditor.find('.goto select').append("<option value='" + animation_name + "'>" + animation_name + "</option>");
      animationEditor.find('.goto select').val(animation_name);
      return animation.mousedown();
    });
    animationEditor.find('.frame_sprites').sortable({
      axis: "x",
      out: function() {
        return $(this).removeClass('highlight');
      },
      over: function() {
        $(this).addClass('highlight');
        return animationEditor.find('.frame_sprites .demo, .frame_sprites p').remove();
      },
      receive: function(event, ui) {
        $(this).removeClass('highlight');
        active_animation().children().remove();
        return active_animation().append(ui.item.find('img').clone());
      }
    });
    $(window).resize(function() {
      if (window.currentComponent === animationEditor) {
        animationEditor.find('.frame_sprites').sortable('refresh');
        return frame_selected_sprite().removeClass('selected');
      }
    });
    animationEditor.find('.user_sprites .sprite_container').draggable({
      addClasses: false,
      connectToSortable: '.frame_sprites',
      containment: 'window',
      helper: 'clone',
      opacity: 0.7,
      refreshPositions: true,
      zIndex: 200
    });
    animationEditor.find('.animation_editor img, .user_sprites .sprite_container').live('click mousedown mousemove', function(event) {
      return event.preventDefault();
    });
    play_next = function() {
      var active, active_index, length, preview_sprites;
      preview_sprites = animationEditor.find('.preview_box img');
      active = animationEditor.find('.preview_box img.active').removeClass('active');
      active_index = active.index();
      length = preview_sprites.length;
      return preview_sprites.eq((active_index + 1) % length).addClass('active');
    };
    play_animation = function() {
      var preview_sprites;
      clearInterval(animation_id);
      if ((animationEditor.find('.preview_box img').length !== animationEditor.find('.frame_sprites img').length) || preview_dirty) {
        preview_dirty = false;
        clear_preview();
        preview_sprites = animationEditor.find('.frame_sprites img').attr('style', '').clone();
        animationEditor.find('.preview_box .sprites').append(preview_sprites);
        preview_sprites.first().addClass('active');
      }
      return animation_id = setInterval(play_next, animationEditor.find('input.speed').val());
    };
    pause_animation = function() {
      return clearInterval(animation_id);
    };
    stop_animation = function() {
      clearInterval(animation_id);
      clear_preview();
      return animationEditor.find('.play').removeClass("pause");
    };
    animationEditor.find('.play').mousedown(function() {
      if ($(this).hasClass("pause")) {
        pause_animation();
      } else {
        play_animation();
      }
      if (!frame_sprites_container().find('.demo').length) {
        return $(this).toggleClass("pause");
      }
    });
    animationEditor.find('.stop').mousedown(function() {
      return stop_animation();
    });
    animationEditor.find('.frame_sprites .sprite_container').live({
      click: function() {
        var $this, _ref, _ref2;
        $this = $(this);
        $this.addClass('selected');
        if (!$this.find('.tags').hasClass('tag_container')) {
          $this.find('.tags').tagbox({
            placeholder: "New event trigger",
            presets: ((_ref = $this.find('.tags')) != null ? (_ref2 = _ref.attr('data-tags')) != null ? _ref2.split(',') : void 0 : void 0) || []
          });
        }
        if ($this.find('.tags').hasClass('tag_container')) {
          animationEditor.find('.frame_sprites .tags').hide();
          $this.find('.tags').show();
          return $this.find('.tag_container input').focus();
        }
      },
      dblclick: function(event) {
        return pixelEditFrame($(this).find('img'));
      },
      mouseenter: function() {
        var duplicate, hflip, vflip, x;
        x = $('<div class="x" title="close" alt="close" />');
        duplicate = $('<div class="duplicate" title="copy this frame" alt="copy this frame" />');
        hflip = $('<div class="hflip" title="flip horizontally" alt="flip horizontally" />');
        vflip = $('<div class="vflip" title="flip vertically" alt="flip vertically" />');
        return $(this).append(x, duplicate, vflip, hflip);
      },
      mouseleave: function() {
        return $(this).find('.x, .duplicate, .hflip, .vflip').remove();
      }
    });
    animationEditor.find('.frame_sprites .sprite_container .tags').live({
      blur: function() {
        return $(this).hide();
      }
    });
    animationEditor.find('.animations input').live({
      change: function() {
        animationEditor.find('.goto select option').remove();
        return animationEditor.find('.animations .animation').each(function(i, animation) {
          var animation_name;
          animation_name = $(animation).prev().val() === "" ? $(animation).prev().text() : $(animation).prev().val();
          return animationEditor.find('.goto select').append("<option value='" + animation_name + "'>" + animation_name + "</option>");
        });
      }
    });
    animationEditor.find('.goto select').change(function() {
      var selected_value;
      selected_value = animationEditor.find('.goto options:selected').val();
      return active_animation().parent().find('.complete').text(selected_value);
    });
    animationEditor.mousedown(function() {
      frame_selected_sprite().removeClass('selected');
      return frame_selected_sprite().find('.tags').hide();
    });
    $(document).bind("keydown", 'h', function(event) {
      var find_hit_circles, image_circles, image_src, selected_sprite;
      if (window.currentComponent === animationEditor) {
        window.editorActive = true;
        event.preventDefault();
      }
      find_hit_circles = function(sprite_el) {
        if ($(sprite_el).length && $(sprite_el).find('img[data-hit_circles]').length && sprite_el.find('img').attr('data-hit_circles').length) {
          return JSON.parse($(sprite_el).find('img').attr('data-hit_circles')).circles;
        }
        return null;
      };
      selected_sprite = frame_selected_sprite();
      if ($(selected_sprite).length) {
        image_src = $(selected_sprite).find('img').attr('src').replace('http://images.pixie.strd6.com', '/s3');
        image_circles = find_hit_circles(selected_sprite);
        return editFrameCircles(selected_sprite, image_circles);
      }
    });
    animationEditor.find('.frame_sprites .x').live('mousedown', function() {
      var parent;
      parent = $(this).parent();
      if (parent.next().length && !parent.next().find('.x').length && !parent.next().find('.duplicate').length) {
        parent.next().append('<div class= "x" />');
        parent.next().append('<div class= "duplicate" />');
      }
      if (parent.get(0) === $('.frame_sprites .sprite_container:last').get(0)) {
        active_animation().children().remove();
        active_animation().append($('.frame_sprites .sprite_container:last').prev().find('img').clone());
      }
      return parent.fadeOut(150, function() {
        parent.remove();
        if (!frame_sprites().length) {
          return templates.find('.placeholder').tmpl().appendTo('.frame_sprites');
        }
      });
    });
    animationEditor.find('.duplicate').live('mousedown', function() {
      var newEl, parent;
      parent = $(this).parent();
      newEl = parent.clone();
      newEl.find('.x, .duplicate, .hflip, .vflip').remove();
      newEl.insertAfter(parent);
      newEl.find('.tags').remove();
      return newEl.find('img').before('<div class="tags" />');
    });
    animationEditor.find('.hflip').live('mousedown', function() {
      return $(this).parent().find('img').toggleClass('flipped_horizontal');
    });
    animationEditor.find('.vflip').live('mousedown', function() {
      return $(this).parent().find('img').toggleClass('flipped_vertical');
    });
    animationEditor.find("button.save").click(function() {
      return typeof options.save === "function" ? options.save(saveData()) : void 0;
    });
    loadData = function(data) {
      var hasComplete;
      if (data != null ? data.animations.length : void 0) {
        animationEditor.find('.goto select').children().remove();
        hasComplete = false;
        $(data.animations).each(function(index, animation) {
          var animation_el, last_sprite_img, matching_animation;
          if (animation.complete) {
            hasComplete = true;
          }
          animationEditor.find('.goto select').append("<option value='" + animation.name + "'>" + animation.name + "</option>");
          animation_el = templates.find('.create_animation').tmpl({
            name: animation.name,
            speed: animation.speed,
            complete: animation.complete
          }).insertBefore('nav.right .new_animation');
          if (animation.hasOwnProperty('interruptible') && animation.interruptible === false) {
            animation_el.find('.cover').addClass('locked');
          }
          active_animation().removeClass('active');
          $.each(animation.frames, function(i, frame) {
            var sprite, sprite_container, _ref, _ref2, _ref3, _ref4, _ref5;
            sprite = data.tileset[frame];
            sprite_container = templates.find('.load_sprite').tmpl({
              url: sprite.src,
              alt: sprite.title,
              title: sprite.title,
              hflip: ((_ref = animation.transform) != null ? (_ref2 = _ref[i]) != null ? _ref2.hflip : void 0 : void 0) || false,
              vflip: ((_ref3 = animation.transform) != null ? (_ref4 = _ref3[i]) != null ? _ref4.vflip : void 0 : void 0) || false,
              id: sprite.id,
              circles: JSON.stringify({
                circles: sprite.circles
              })
            }).appendTo(animationEditor.find('.animations .animation').eq(index).find('.sprites'));
            sprite_container.find('.tags').tagbox({
              placeholder: "New event trigger",
              presets: ((_ref5 = animation.triggers) != null ? _ref5[i] : void 0) || []
            });
            return sprite_container.find('.tags').hide();
          });
          matching_animation = animationEditor.find('.animations .animation').eq(index);
          last_sprite_img = matching_animation.find('.sprites .sprite_container:last img');
          return matching_animation.find('.cover').append(last_sprite_img.clone());
        });
        if (!hasComplete) {
          animationEditor.find('.goto').remove();
        }
        animationEditor.find('.speed').val(active_animation().find('.speed').text());
        stop_animation();
        clear_frame_sprites();
        active_animation().find('.sprites').children().clone().appendTo(frame_sprites_container());
        animationCount = animationEditor.find('.animations .animation').length;
        return animationEditor.find('.animations .animation').first().mousedown();
      } else {
        templates.find('.create_animation').tmpl({
          name: "Animation 1",
          speed: animationEditor.find('.speed').val(),
          complete: "Animation 1"
        }).insertBefore(animationEditor.find('.new_animation'));
        animationCount = animationEditor.find('.animations .animation').length;
        templates.find('.placeholder').tmpl().appendTo(animationEditor.find('.frame_sprites'));
        return animationEditor.find('.goto select').append("<option value='Animation 1'>Animation 1</option>");
      }
    };
    saveData = function() {
      var animation_data, frames, srcs, tiles;
      update_active_animation();
      frames = [];
      srcs = [];
      tiles = [];
      animationEditor.find('.animations .animation').find('.sprites img').each(function(i, img) {
        var circles, tile;
        circles = $(img).data('hit_circles') ? $(img).data('hit_circles').circles : [];
        tile = {
          id: $(img).data('id'),
          src: $(img).attr('src'),
          title: $(img).attr('title') || $(img).attr('alt'),
          circles: circles
        };
        if ($.inArray(tile.src, srcs) === -1) {
          srcs.push(tile.src);
          return tiles.push(tile);
        }
      });
      animation_data = animationEditor.find('.animations .animation').map(function() {
        var animation, frame_data, transform, triggers;
        triggers = {};
        transform = [];
        frame_data = $(this).find('.sprites img').each(function(i, img) {
          var hflip, tile_src, vflip;
          tile_src = $(this).attr('src');
          hflip = false;
          vflip = false;
          if ($(img).parent().find('.tags').attr('data-tags') && $(img).parent().find('.tags').attr('data-tags').length) {
            triggers[i] = $(img).parent().find('.tags').attr('data-tags').split(',');
          }
          if ($(img).hasClass('flipped_vertical')) {
            vflip = true;
          }
          if ($(img).hasClass('flipped_horizontal')) {
            hflip = true;
          }
          transform.push({
            hflip: hflip,
            vflip: vflip
          });
          return frames.push(srcs.indexOf(tile_src));
        });
        if (frames.length) {
          animation = {
            complete: $(this).find('.complete').text(),
            name: $(this).prev().text(),
            interruptible: !$(this).find('.cover').hasClass('locked'),
            speed: $(this).find('.speed').text(),
            transform: transform,
            triggers: triggers,
            frames: frames
          };
        }
        frames = [];
        transform = [];
        return animation;
      }).get();
      return {
        version: "1.4",
        name: "Animation",
        tileset: tiles,
        animations: animation_data
      };
    };
    loadData(options.data);
    return $.extend(animationEditor, {
      animationData: saveData
    });
  };
}).call(this);
