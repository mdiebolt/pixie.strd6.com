/* DO NOT MODIFY. This file was compiled Thu, 26 May 2011 22:45:45 GMT from
 * /home/daniel/apps/pixie.strd6.com/app/coffeescripts/jquery.tile_editor.coffee
 */

(function() {
  $.fn.tileEditor = function(options) {
    var addNewLayer, addScreenLayer, clearSelection, clickMode, createNewTile, createPixelEditor, createdTileCount, currentLayer, currentTool, debugMode, deleteTile, dirty, eachEntity, editEntity, entered, filledToken, firstGID, floodFill, generateUuid, getNeighborPositions, grid, harvestSelection, hotkeys, inBounds, isInSelection, layerSelect, loadData, loadEntity, loadExternalEntities, modeDown, nextTile, pixelEditTile, positionElementIndices, prevTile, propEditor, propElement, removeEntity, removeTile, replaceTile, saveData, savedSelectionCount, select, selectNextVisibleLayer, selectTile, selectTool, selectionCache, selectionCopy, selectionCut, selectionDelete, selectionEach, selectionStart, showPropertiesEditor, stamp, templates, tileAt, tileEditor, tileHeight, tileLookup, tilePosition, tileTray, tileWidth, tilesTall, tilesWide;
    options = $.extend({
      layers: ["Background", "Entities"],
      eachEntity: $.noop,
      editEntity: $.noop,
      loadEntity: $.noop,
      removeEntity: $.noop,
      tilesWide: 20,
      tilesTall: 15,
      tileWidth: 32,
      tileHeight: 32
    }, options);
    tileEditor = $(this.get(0)).addClass("editor tile_editor");
    templates = $("#tile_editor_templates");
    templates.find(".editor.template").tmpl().appendTo(tileEditor);
    debugMode = false;
    dirty = false;
    firstGID = 1;
    eachEntity = options.eachEntity, editEntity = options.editEntity, loadEntity = options.loadEntity, removeEntity = options.removeEntity;
    tilesWide = parseInt(options.tilesWide, 10);
    tilesTall = parseInt(options.tilesTall, 10);
    tileWidth = parseInt(options.tileWidth, 10);
    tileHeight = parseInt(options.tileHeight, 10);
    currentLayer = 0;
    modeDown = null;
    tileTray = ".module .tiles";
    layerSelect = ".module .layer_select";
    positionElementIndices = [];
    grid = GridGen({
      width: tileWidth,
      height: tileHeight
    });
    if ($.fn.pixie) {
      createPixelEditor = function(options) {
        var pixelEditor, url;
        url = options.url;
        tileEditor = options.tileEditor;
        pixelEditor = $('<div />').pixie({
          width: options.width,
          height: options.height,
          initializer: function(canvas) {
            if (url) {
              canvas.fromDataURL(url);
            }
            canvas.addAction({
              name: "Save Tile",
              icon: "/images/icons/database_save.png",
              perform: function(canvas) {
                pixelEditor.trigger('save', canvas.toDataURL());
                pixelEditor.remove();
                return tileEditor.show();
              },
              undoable: false
            });
            return canvas.addAction({
              name: "Back to Tilemap",
              icon: "/images/icons/arrow_left.png",
              perform: function(canvas) {
                pixelEditor.remove();
                return tileEditor.show();
              },
              undoable: false
            });
          }
        });
        tileEditor.hide().after(pixelEditor);
        window.currentComponent = pixelEditor;
        return pixelEditor;
      };
    }
    pixelEditTile = function(selectedTile) {
      var imgSource, pixelEditor;
      if (createPixelEditor) {
        imgSource = selectedTile.attr('src');
        pixelEditor = createPixelEditor({
          width: selectedTile.get(0).width,
          height: selectedTile.get(0).height,
          tileEditor: tileEditor,
          url: imgSource.replace('http://images.pixie.strd6.com', '/s3')
        });
        return pixelEditor.bind('save', function(event, data) {
          var img;
          img = $("<img/>", {
            src: data
          });
          return tileEditor.find('.component .tiles').append(img);
        });
      }
    };
    generateUuid = function() {
      return Math.uuid(32, 16);
    };
    createdTileCount = 0;
    createNewTile = function() {
      var pixelEditor;
      if (createPixelEditor) {
        pixelEditor = createPixelEditor({
          width: tileWidth,
          height: tileHeight,
          tileEditor: tileEditor
        });
        return pixelEditor.bind('save', function(event, data) {
          var entity, img, name, src, uuid;
          uuid = generateUuid();
          name = "New Tile " + (createdTileCount += 1);
          src = data;
          img = $("<img/>", {
            alt: name,
            "data-uuid": uuid,
            src: src,
            title: name
          });
          entity = {
            name: name,
            tileSrc: src
          };
          loadEntity(uuid, {
            src: src,
            entity: entity
          });
          return tileEditor.find('.component .tiles').append(img);
        });
      }
    };
    deleteTile = function(tile) {
      var uuid;
      uuid = tile.remove().data('uuid');
      removeEntity(uuid);
      return tileEditor.find(".screen img[data-uuid=" + uuid + "]").remove();
    };
    tilePosition = function(element, event) {
      var localX, localY, offset;
      offset = element.offset();
      localY = (event.pageY - offset.top).snap(tileHeight).clamp(0, (tilesTall - 1) * tileHeight);
      localX = (event.pageX - offset.left).snap(tileWidth).clamp(0, (tilesWide - 1) * tileWidth);
      return {
        x: localX,
        y: localY
      };
    };
    addScreenLayer = function() {
      $("<div />", {
        "class": "layer",
        width: tilesWide * tileWidth,
        height: tilesTall * tileHeight
      }).appendTo(tileEditor.find("section .layers"));
      tileEditor.find(".screen").find(".cursor, .selection").appendTo(tileEditor.find("section .layers"));
      return positionElementIndices.push({});
    };
    addNewLayer = function(layerName) {
      layerName || (layerName = "Layer " + (tileEditor.find(".layer_select .choice").length + 1));
      templates.find(".layer_select.template").tmpl({
        name: layerName
      }).appendTo(tileEditor.find(layerSelect)).find('.name').mousedown();
      return addScreenLayer();
    };
    selectNextVisibleLayer = function() {
      var shownLayers;
      shownLayers = tileEditor.find(".layer_select .choice .show.on");
      if (shownLayers.length) {
        return shownLayers.eq(0).parent().find(".name").mousedown();
      }
    };
    prevTile = function(mode) {
      var cur, tileCount;
      tileCount = $(".tiles img").length;
      cur = tileEditor.find(".tiles ." + mode).removeClass(mode).index();
      return tileEditor.find(".tiles img").eq((cur - 1).mod(tileCount)).addClass(mode);
    };
    nextTile = function(mode) {
      var cur, tileCount;
      tileCount = tileEditor.find(".tiles img").length;
      cur = tileEditor.find(".tiles ." + mode).removeClass(mode).index();
      return tileEditor.find(".tiles img").eq((cur + 1).mod(tileCount)).addClass(mode);
    };
    inBounds = function(x, y) {
      return ((0 <= x && x < tileWidth * tilesWide)) && ((0 <= y && y < tileHeight * tilesTall));
    };
    replaceTile = function(x, y, tile) {
      var posString, targetLayer;
      if (!inBounds(x, y)) {
        return;
      }
      if (!dirty) {
        dirty = true;
        tileEditor.trigger("dirty");
      }
      posString = x + "x" + y;
      tile = tile.clone().removeClass("primary secondary").css({
        position: "absolute",
        top: y,
        left: x
      }).attr("data-pos", posString);
      targetLayer = tileEditor.find(".screen .layer").eq(currentLayer);
      removeTile(x, y);
      targetLayer.append(tile);
      positionElementIndices[currentLayer][posString] = tile.get();
      return tile;
    };
    removeTile = function(x, y) {
      var posString;
      if (!dirty) {
        dirty = true;
        tileEditor.trigger("dirty");
      }
      tileAt(x, y).remove();
      posString = x + "x" + y;
      return positionElementIndices[currentLayer][posString] = void 0;
    };
    tileAt = function(x, y) {
      var posString;
      posString = x + "x" + y;
      return $(positionElementIndices[currentLayer][posString]);
    };
    getNeighborPositions = function(position) {
      var neighbors;
      return neighbors = [[position[0] - tileWidth, position[1]], [position[0] + tileWidth, position[1]], [position[0], position[1] - tileHeight], [position[0], position[1] + tileHeight]].select(function(neighborPos) {
        return inBounds(neighborPos[0], neighborPos[1]);
      });
    };
    filledToken = 0;
    floodFill = function(x, y, mode) {
      var inSelection, neighbors, position, queue, selection, sourceTiles, targetTile, targetUuid, tile;
      if ((tile = tileEditor.find(".tiles").find("." + mode)).length) {
        sourceTiles = [[tile]];
      } else if (selection = tileEditor.find(".saved_selections").find("." + mode).data("selectionData")) {
        sourceTiles = selection;
      }
      filledToken += 1;
      inSelection = isInSelection(x, y);
      targetTile = tileAt(x, y);
      targetUuid = targetTile.data("uuid");
      tile = sourceTiles[0][0];
      queue = [];
      replaceTile(x, y, tile).data("fill", filledToken);
      queue.push([x, y]);
      while (position = queue.pop()) {
        neighbors = getNeighborPositions(position);
        neighbors.each(function(neighbor, index) {
          var currentUuid;
          if (inSelection === isInSelection(neighbor[0], neighbor[1])) {
            tile = sourceTiles.wrap((neighbor[1] - y) / tileHeight).wrap((neighbor[0] - x) / tileWidth);
            if (neighbor) {
              targetTile = tileAt(neighbor[0], neighbor[1]);
              currentUuid = targetTile.data("uuid");
              if (currentUuid === targetUuid && targetTile.data("fill") !== filledToken) {
                replaceTile(neighbor[0], neighbor[1], tile).data("fill", filledToken);
                return queue.push(neighbor);
              }
            }
          }
        });
      }
      return;
    };
    selectionCache = null;
    isInSelection = function(x, y) {
      if (selectionCache) {
        return (selectionCache.top <= y && y < selectionCache.top + selectionCache.height) && (selectionCache.left <= x && x < selectionCache.left + selectionCache.width);
      } else {
        return false;
      }
    };
    clearSelection = function() {
      tileEditor.find(".screen .selection").removeClass("active");
      return selectionCache = null;
    };
    selectionEach = function(callback) {
      var $selection, pos, selectionHeight, selectionWidth, x, y;
      $selection = tileEditor.find(".screen .selection");
      if ($selection.hasClass("active")) {
        pos = $selection.position();
        selectionWidth = $selection.outerWidth();
        selectionHeight = $selection.outerHeight();
        y = pos.top;
        while (y < pos.top + selectionHeight) {
          x = pos.left;
          while (x < pos.left + selectionWidth) {
            callback(x, y);
            x += tileWidth;
          }
          y += tileHeight;
        }
        return clearSelection();
      }
    };
    selectionDelete = function() {
      return selectionEach(removeTile);
    };
    savedSelectionCount = 0;
    harvestSelection = function(remove) {
      var preview, row, rowY, savedSelection, selectionData;
      rowY = void 0;
      row = void 0;
      savedSelection = templates.find(".saved_selection.template").tmpl({
        text: "Selection" + (++savedSelectionCount)
      }).appendTo(tileEditor.find(".saved_selections"));
      preview = savedSelection.find(".preview");
      selectionData = [];
      selectionEach(function(x, y) {
        var tile;
        if (y !== rowY) {
          rowY = y;
          row = [];
          selectionData.push(row);
        }
        tile = tileAt(x, y).clone();
        row.push(tile);
        tile.css({
          position: "absolute",
          top: (selectionData.length - 1) * tileHeight,
          left: (row.length - 1) * tileWidth
        });
        preview.append(tile);
        if (remove) {
          return removeTile(x, y);
        }
      });
      savedSelection.data("selectionData", selectionData);
      return selectTile(savedSelection, "primary");
    };
    selectionCopy = function() {
      return harvestSelection();
    };
    selectionCut = function() {
      return harvestSelection(true);
    };
    selectionStart = null;
    select = function(x, y) {
      var $selection, deltaX, deltaY, pos, selectionHeight, selectionLeft, selectionTop, selectionWidth;
      if (selectionStart) {
        $selection = tileEditor.find(".screen .selection");
        pos = $selection.position();
        deltaX = x - selectionStart.x;
        deltaY = y - selectionStart.y;
        selectionWidth = deltaX.abs() + tileWidth;
        selectionHeight = deltaY.abs() + tileHeight;
        selectionLeft = deltaX < 0 ? x : selectionStart.x;
        selectionTop = deltaY < 0 ? y : selectionStart.y;
        selectionCache = {
          height: selectionHeight,
          left: selectionLeft,
          top: selectionTop,
          width: selectionWidth
        };
        return $selection.css(selectionCache);
      } else {
        selectionCache = {
          height: tileHeight,
          left: x,
          top: y,
          width: tileWidth
        };
        tileEditor.find(".screen .selection").addClass('active').css(selectionCache);
        return selectionStart = {
          x: x,
          y: y
        };
      }
    };
    stamp = function(x, y, mode) {
      var selection, tile;
      if ((tile = tileEditor.find(".tiles").find("." + mode)).length) {
        return replaceTile(x, y, tile);
      } else if (selection = tileEditor.find(".saved_selections").find("." + mode).data("selectionData")) {
        return selection.each(function(row, tileY) {
          return row.each(function(tile, tileX) {
            var targetX, targetY;
            if (tile) {
              targetX = x + tileX * tileWidth;
              targetY = y + tileY * tileHeight;
              return replaceTile(targetX, targetY, tile);
            }
          });
        });
      }
    };
    currentTool = function(mode) {
      return tileEditor.find(".tools .tool." + mode).data("tool");
    };
    entered = function(x, y) {
      var mode;
      if (mode = modeDown) {
        switch (currentTool(mode)) {
          case "stamp":
            return stamp(x, y, mode);
          case "eraser":
            return removeTile(x, y);
          case "fill":
            return floodFill(x, y, mode);
          case "selection":
            return select(x, y);
        }
      }
    };
    clickMode = function(event) {
      if (event.which === 1) {
        return "primary";
      } else if (event.which === 3) {
        return "secondary";
      }
    };
    selectTool = function(name, mode) {
      var tool;
      tool = tileEditor.find(".tools .tool[data-tool=" + name + "]");
      return tool.takeClass(mode);
    };
    selectTile = function(tile, mode) {
      tileEditor.find(".saved_selections .selection").removeClass(mode);
      tileEditor.find(".tiles img").removeClass(mode);
      return tile.addClass(mode);
    };
    propElement = null;
    showPropertiesEditor = function(element) {
      propElement = element;
      propEditor.setProps(propElement.data("properties"));
      return propEditor.parent().show();
    };
    tileEditor.bind("contextmenu", function(event) {
      if (!debugMode) {
        return event.preventDefault();
      }
    });
    $(".tools .tool", tileEditor).live('mousedown', function(event) {
      var mode;
      event.preventDefault();
      if (mode = clickMode(event)) {
        return $(this).takeClass(mode);
      }
    });
    $(".tiles img, .saved_selections .selection", tileEditor).live({
      mousedown: function(event) {
        var mode;
        event.preventDefault();
        if (mode = clickMode(event)) {
          return selectTile($(this), mode);
        }
      }
    });
    $(".tiles img, .saved_selections .selection", tileEditor).live('mouseup', function(event) {
      if (event.which === 2) {
        return $(this).remove();
      }
    });
    $(".tiles img", tileEditor).live("dblclick", function(event) {
      return editEntity($(this).data('uuid'));
    });
    tileEditor.find("button.new_tile").click(function() {
      return createNewTile();
    });
    tileEditor.find("button.delete_tile").click(function() {
      return deleteTile(tileEditor.find('.tiles img.primary'));
    });
    tileEditor.find(".prop_save").click(function(event) {
      if (propElement) {
        propElement.data("properties", propEditor.getProps());
        return propEditor.parent().hide();
      }
    });
    tileEditor.find(".layer_select").parent().find('.new').click(function() {
      return addNewLayer();
    });
    $(".layer_select .choice .name", tileEditor).live('mousedown', function(event) {
      var $layer;
      $layer = $(this).parent();
      $layer.takeClass("active");
      return currentLayer = $layer.index();
    });
    tileEditor.find(".layer_select").delegate(".show", 'mousedown', function(event) {
      var $choice, $this;
      $this = $(this);
      $choice = $this.parent();
      if ($this.toggleClass("on").hasClass("on")) {
        tileEditor.find(".screen .layers .layer").eq($choice.index()).fadeIn();
        return $choice.find(".name").mousedown();
      } else {
        tileEditor.find(".screen .layers .layer").eq($choice.index()).fadeOut();
        return selectNextVisibleLayer();
      }
    });
    tileEditor.find(".screen .layers").bind("mousemove", function(event) {
      var oldPos, pos;
      pos = tilePosition($(this), event);
      oldPos = tileEditor.find(".screen .cursor").position();
      if (!(oldPos.left === pos.x && oldPos.top === pos.y)) {
        entered(pos.x, pos.y);
        return tileEditor.find(".screen .cursor").css({
          left: pos.x,
          top: pos.y
        });
      }
    });
    tileEditor.find(".screen .layers").bind("mousedown", function(event) {
      var pos;
      if (modeDown = clickMode(event)) {
        pos = tilePosition($(this), event);
        return entered(pos.x, pos.y);
      }
    });
    $(document).bind("mouseup", function(event) {
      selectionStart = null;
      return modeDown = null;
    });
    tileEditor.mousedown(function() {
      return window.currentComponent = tileEditor;
    });
    hotkeys = {
      a: function(event) {
        return prevTile("primary");
      },
      z: function(event) {
        return nextTile("primary");
      },
      s: function(event) {
        return prevTile("secondary");
      },
      x: function(event) {
        return nextTile("secondary");
      },
      p: function() {
        return showPropertiesEditor(tileEditor.find('.tiles img.primary'));
      },
      i: function() {
        var left, tile, top, _ref;
        _ref = tileEditor.find(".screen .cursor").position(), left = _ref.left, top = _ref.top;
        if ((tile = tileAt(left, top)).length) {
          return showPropertiesEditor(tile);
        }
      },
      backspace: selectionDelete,
      del: selectionDelete,
      esc: clearSelection,
      "ctrl+c": selectionCopy,
      "ctrl+x": selectionCut
    };
    $.each(hotkeys, function(key, fn) {
      return $(document).bind("keydown", key, function(event) {
        if (window.currentComponent === tileEditor) {
          event.preventDefault();
          return fn(event);
        }
      });
    });
    tileEditor.find(tileTray).sortable();
    tileEditor.dropImageReader(function(file, event) {
      var entity, img, name, src, uuid;
      if (event.target.readyState === FileReader.DONE) {
        uuid = generateUuid();
        src = event.target.result;
        name = file.name.replace(/\.[^\.]*$/, '');
        img = $("<img/>", {
          alt: name,
          src: src,
          title: name,
          "data-uuid": uuid
        });
        entity = {
          name: name,
          tileSrc: src
        };
        loadEntity(uuid, {
          src: src,
          entity: entity
        });
        return $(this).find(".tiles").append(img);
      }
    });
    $('.filename, .layer_select .name, .saved_selections .name', tileEditor).liveEdit();
    propEditor = $(".prop_editor", tileEditor).propertyEditor();
    tileEditor.find("button.save").click(function() {
      return typeof options.save === "function" ? options.save(saveData()) : void 0;
    });
    saveData = function() {
      var entityCache, layers;
      entityCache = {};
      tileEditor.find(".module .tiles img").each(function() {
        var $this, entity, mapTileData, props, src, uuid;
        $this = $(this);
        uuid = $this.data("uuid");
        src = $this.attr("src");
        entity = {
          tileSrc: src
        };
        mapTileData = {
          entity: entity,
          src: src
        };
        loadEntity(uuid, mapTileData);
        if (props = $this.data("properties")) {
          mapTileData.properties = props;
        }
        return entityCache[uuid] = mapTileData;
      });
      layers = [];
      tileEditor.find(".layer_select .choice").each(function(i) {
        var $this, entities, entityLayer, layer, name, screenLayer, tileLookup, tiles;
        $this = $(this);
        name = $this.text().trim();
        entityLayer = name.match(/entities/i);
        screenLayer = tileEditor.find(".screen .layers .layer").eq(i);
        if (entityLayer) {
          entities = screenLayer.find("img").map(function() {
            var $element, left, top, uuid, _ref;
            $element = $(this);
            uuid = $element.data("uuid");
            _ref = $element.position(), top = _ref.top, left = _ref.left;
            return {
              x: left,
              y: top,
              uuid: uuid,
              properties: $(this).data("properties")
            };
          }).get();
          layer = {
            name: name,
            entities: entities
          };
        } else {
          tileLookup = {};
          screenLayer.find("img").each(function() {
            var pos, uuid;
            uuid = this.getAttribute("data-uuid");
            pos = this.getAttribute("data-pos");
            return tileLookup[pos] = uuid;
          });
          tiles = [];
          tilesTall.times(function(y) {
            var row;
            row = [];
            tiles.push(row);
            return tilesWide.times(function(x) {
              var posString;
              posString = x * tileWidth + "x" + y * tileHeight;
              return row.push(tileLookup[posString]);
            });
          });
          layer = {
            name: name,
            tiles: tiles
          };
        }
        return layers.push(layer);
      });
      return {
        title: tileEditor.find(".filename").text(),
        orientation: "orthogonal",
        width: tilesWide,
        height: tilesTall,
        tileWidth: tileWidth,
        tileHeight: tileHeight,
        entityCache: entityCache,
        layers: layers
      };
    };
    loadData = function(data, tileLookup) {
      tileWidth = data.tileWidth, tileHeight = data.tileHeight;
      tilesWide = data.width;
      tilesTall = data.height;
      positionElementIndices = [];
      tileEditor.find("section .layers .layer").remove();
      tileEditor.find(layerSelect).html('');
      data.layers.each(function(layer, i) {
        var entities, entity, tile, tiles, _i, _len, _results;
        currentLayer = i;
        addScreenLayer();
        templates.find(".layer_select.template").tmpl({
          name: layer.name
        }).appendTo(tileEditor.find(layerSelect));
        if (tiles = layer.tiles) {
          tiles.each(function(row, y) {
            return row.each(function(uuid, x) {
              if (uuid) {
                return replaceTile(x * tileWidth, y * tileHeight, tileLookup[uuid]);
              }
            });
          });
        }
        if (entities = layer.entities) {
          _results = [];
          for (_i = 0, _len = entities.length; _i < _len; _i++) {
            entity = entities[_i];
            tile = replaceTile(entity.x, entity.y, tileLookup[entity.uuid]);
            _results.push(entity.properties ? tile.data("properties", entity.properties) : void 0);
          }
          return _results;
        }
      });
      return tileEditor.find(layerSelect).find(".name").last().trigger("mousedown");
    };
    loadExternalEntities = function(data) {
      var entityCache, index, tileData, tileLookup, uuid;
      if (entityCache = data != null ? data.entityCache : void 0) {
        for (uuid in entityCache) {
          tileData = entityCache[uuid];
          loadEntity(uuid, tileData);
        }
      }
      tileEditor.find(tileTray).html('');
      tileLookup = {};
      index = 0;
      eachEntity(function(uuid, entity) {
        var active, src;
        active = index === 0 ? "primary" : index === 1 ? "secondary" : void 0;
        src = entity.tileSrc;
        tileLookup[uuid] = $("<img />", {
          "class": active,
          "data-uuid": uuid,
          src: src
        }).appendTo(tileEditor.find(tileTray));
        if (typeof cachedEntity != "undefined" && cachedEntity !== null ? cachedEntity.properties : void 0) {
          tileLookup[uuid].data("properties", cachedEntity.properties);
        }
        return index += 1;
      });
      return tileLookup;
    };
    tileLookup = loadExternalEntities(options.data);
    if (options.data) {
      loadData(options.data, tileLookup);
    } else {
      if (options.layers.each) {
        options.layers.each(function(layerName) {
          return addNewLayer(layerName);
        });
      } else if (options.layers.times) {
        options.layers.times(function() {
          return addNewLayer();
        });
      }
    }
    tileEditor.find(".screen .cursor").css({
      width: tileWidth - 1,
      height: tileHeight - 1
    });
    tileEditor.find(".screen .layers").css({
      backgroundImage: grid.backgroundImage(),
      width: tilesWide * tileWidth,
      height: tilesTall * tileHeight
    });
    tileEditor.bind("clean", function() {
      return dirty = false;
    });
    dirty = false;
    return $.extend(tileEditor, {
      addAction: function(action) {
        var actionButton;
        actionButton = $("<button/>", {
          text: action.name,
          click: action.perform
        });
        return tileEditor.find(".actions").append(actionButton);
      },
      mapData: saveData
    });
  };
}).call(this);
