import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GraphicComponent } from "./components/graphic/graphic.component";
import { D3FiddlinComponent } from "./components/d3-fiddlin/d3-fiddlin.component";

const routes: Routes = [
  {
    path: "",
    component: GraphicComponent,
    pathMatch: "full"
  },
  {
    path: "fiddlin",
    component: D3FiddlinComponent,
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
