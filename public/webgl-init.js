// Set localStorage values for reduced graphics
if (typeof localStorage !== 'undefined') {
  localStorage.clear();
  
  // Force minimal rendering settings
  localStorage.setItem('webgl_initialized', 'true');
  
  console.log('Set minimal WebGL settings');
}
