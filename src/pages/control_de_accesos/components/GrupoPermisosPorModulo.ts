import { Permiso, Modulo } from "../data/models";

export interface GrupoPermisos {
  moduloHijo: Modulo;
  moduloPadre?: Modulo;
  modulosNieto: Modulo[];
  permisos: Permiso[];
}

export function clasificarModulosPorJerarquia(modulos: Modulo[]) {
  const modulosPadre = modulos.filter(m => m.dependencia === null);
  const modulosHijo = modulos.filter(m => 
    m.dependencia !== null && 
    modulosPadre.some(p => p.id_modulo === m.dependencia)
  );
  const modulosNieto = modulos.filter(m => 
    m.dependencia !== null && 
    modulosHijo.some(h => h.id_modulo === m.dependencia)
  );

  return {
    modulosPadre,
    modulosHijo,
    modulosNieto
  };
}

export function getModuloPadre(moduloHijo: Modulo, modulosPadre: Modulo[]): Modulo | undefined {
  return modulosPadre.find(padre => padre.id_modulo === moduloHijo.dependencia);
}


export function getModulosNieto(moduloHijoId: number, modulosNieto: Modulo[]): Modulo[] {
  return modulosNieto.filter(nieto => nieto.dependencia === moduloHijoId);
}


export function filtrarPermisos(
  permisos: Permiso[],
  searchTerm: string,
  selectedModuloPadre: number | null,
  selectedModuloHijo: number | null,
  modulosHijo: Modulo[],
  modulosNieto: Modulo[]
): Permiso[] {
  return permisos.filter((permiso) => {
    const matchesSearch =
      permiso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permiso.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesModuloPadre = true;
    if (selectedModuloPadre !== null) {
      const modulosHijoDelPadre = modulosHijo.filter(h => h.dependencia === selectedModuloPadre);
      const idsModulosHijo = modulosHijoDelPadre.map(h => h.id_modulo);
      const modulosNietoDelPadre = modulosNieto.filter(n => idsModulosHijo.includes(n.dependencia!));
      const idsModulosNieto = modulosNietoDelPadre.map(n => n.id_modulo);
      
      matchesModuloPadre = idsModulosNieto.includes(permiso.id_modulo!);
    }
    
    let matchesModuloHijo = true;
    if (selectedModuloHijo !== null) {
      const nietosDelHijo = getModulosNieto(selectedModuloHijo, modulosNieto);
      const idsNietos = nietosDelHijo.map(n => n.id_modulo);
      matchesModuloHijo = idsNietos.includes(permiso.id_modulo!);
    }

    return matchesSearch && matchesModuloPadre && matchesModuloHijo;
  });
}

export function agruparPermisosPorModulo(
  permisosFiltrados: Permiso[],
  modulosHijo: Modulo[],
  modulosPadre: Modulo[],
  modulosNieto: Modulo[]
): GrupoPermisos[] {
  return modulosHijo
    .map((moduloHijo) => {
      const nietosDelHijo = getModulosNieto(moduloHijo.id_modulo, modulosNieto);
      const idsRelevantes = [moduloHijo.id_modulo, ...nietosDelHijo.map(n => n.id_modulo)];
      
      const permisosDelHijo = permisosFiltrados.filter(p => 
        idsRelevantes.includes(p.id_modulo!)
      );
      
      return {
        moduloHijo,
        moduloPadre: getModuloPadre(moduloHijo, modulosPadre),
        modulosNieto: nietosDelHijo,
        permisos: permisosDelHijo,
      };
    })
    .filter((item) => item.permisos.length > 0)
    .sort((a, b) => {
      const padreA = a.moduloPadre?.nombre || '';
      const padreB = b.moduloPadre?.nombre || '';
      if (padreA !== padreB) {
        return padreA.localeCompare(padreB);
      }
      return a.moduloHijo.nombre.localeCompare(b.moduloHijo.nombre);
    });
}

export function getModulosHijoFiltrados(
  modulosHijo: Modulo[],
  selectedModuloPadre: number | null
): Modulo[] {
  return selectedModuloPadre 
    ? modulosHijo.filter(h => h.dependencia === selectedModuloPadre)
    : modulosHijo;
}