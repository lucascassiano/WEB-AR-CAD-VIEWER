/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */



THREE.DragControls = function ( _objects, _camera, _domElement, _document ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

    }
    
    var arrow = new Arrows();
    var transformType;
    var _key;

	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();
	var _worldPosition = new THREE.Vector3();
	var _inverseMatrix = new THREE.Matrix4();
	
	var _selected = null,_hovered = null;

	var _lastSelected = null, _pastPosition = new THREE.Vector3(), _lastAction = null, _currentPosition = new THREE.Vector3();

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
        _domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );
        _document.addEventListener('keydown', onkeydown, false);
        _document.addEventListener('keyup', onkeyup, false);
	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );
        _document.removeEventListener('keydown', onkeydown, false);
        _document.removeEventListener('keyup', onkeyup, false);
	}

	function dispose() {

		deactivate();

	}
	
	 this.getSelected = function(){
		return _lastSelected;
	};

	this.getLastPosition = function(){
		return _pastPosition;
	};

	this.getCurrentPosition = function(){
		return _currentPosition;
	};

	this.getLastAction = function(action){
		if(action != null){
			_lastAction = action;
		}else{
			return _lastAction;
		}
		
	};
    
    

	function onDocumentMouseMove( event ) {

        event.preventDefault();
        
       

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
                
                let posV = new THREE.Vector3();
                posV.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ));
                if(transformType == "q"){
                    if(_key === "z"){
                        _selected.position.set(posV.x, _selected.position.y, _selected.position.z );
                        
                    }else if(_key === "x"){
                        _selected.position.set( _selected.position.x ,posV.y, _selected.position.z );
                        
                    }else if(_key === "c"){
                        _selected.position.set( _selected.position.x , _selected.position.y ,posV.z );
                    }else{
                        _selected.position.copy(posV);
                    }
                }else{
                    if(_key === "z"){
                        _selected.rotation.x += 0.0872665  ;
                        
                    }else if(_key === "x"){
                        _selected.rotation.y += 0.0872665  ;
                        
                    }else if(_key === "c"){
                        _selected.rotation.z += 0.0872665 ;
                    }
				}
				
				
               
			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			
			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );
                
				_domElement.style.cursor = 'pointer';
                _hovered = object;
                
                arrow.attach(object, _key);
               
			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

                _domElement.style.cursor = 'auto';

                arrow.detach(_hovered);

                _hovered = null;
                
                

			}

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			_lastSelected = _selected;

			_pastPosition.copy( _selected.position);

			
			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

                if(transformType == "q"){
                    _inverseMatrix.getInverse( _selected.parent.matrixWorld );
                    _offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
                }
			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseCancel( event ) {

		event.preventDefault();

		if ( _selected ) {

			_currentPosition.copy(_selected.position);

			_lastAction = "drag";

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	}

	function onDocumentTouchMove( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

	}

	function onDocumentTouchStart( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_inverseMatrix.getInverse( _selected.parent.matrixWorld );
				_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentTouchEnd( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = 'auto';

    }

    function onkeydown(event){
        _key = event.key;
        if(_key === "q"){
            transformType = "q";
        }else if(_key === "w"){
            transformType = "w";
        }
    }
    function onkeyup(){
        
        if(_key !== "q" && _key !== "w"){
            if(transformType != null){
                _key = transformType;
            }else{
                _key = null;
            }
            
        }
       
    }


	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

	this.on = function ( type, listener ) {

		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.dispatchEvent( { type: type } );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;